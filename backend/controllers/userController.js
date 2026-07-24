import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import razorpay from 'razorpay'
import crypto from 'crypto'

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const user = await userModel.findOne({ email })

        if (user) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a valid email" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Enter a strong password" });
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData)
        await newUser.save()

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET)

        res.json({ success: true, token, message: "User registered successfully" })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

// APi for user login

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid Credetials" })
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

const getProfile = async (req, res) => {
    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data is missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {
            //Upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })

        }

        res.json({ success: true, message: "Profile Updated" })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

//API to book apointment

const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime } = req.body

        const docData = await doctorModel.findById(docId).select("-password")

        if (!docData) {
            return res.json({ success: false, message: "Doctor not found" })
        }

        if (!docData.available) {
            return res.json({ success: false, message: "Doctor is not available" })
        }

        // 1. Check if the slot is booked by ANY patient in active (non-cancelled) appointments
        const slotBooked = await appointmentModel.findOne({
            docId,
            slotDate,
            slotTime,
            cancelled: false
        })

        if (slotBooked) {
            return res.json({ success: false, message: "Slot already booked by another user" })
        }

        // 2. Checking slots availability in doctor's local slots_booked Object
        let slots_booked = docData.slots_booked || {}

        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: "Slot Not Available" })
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select('-password')

        // 3. Clone docData into a plain object to prevent deleting slots_booked from original Mongoose object
        const docDataObj = docData.toObject()
        delete docDataObj.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData: docDataObj,
            amount: docData.fee,
            slotDate,
            slotTime,
            date: Date.now(),
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()
        
        // 4. Update doctor's slot list in the database
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: "Appointment Booked" })

    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.json({ success: false, message: "Slot already booked by another user" })
        }
        return res.status(500).json({ success: false, message: error.message });
    }
}

//API to get user appointments

const listAppointment = async (req, res) => {
    try {
        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId })
        res.json({ success: true, appointments })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

//API to cancel appointment

const cancelAppointment = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData) {
            return res.json({ success: false, message: "Appointment not found" })
        }

        //verify appointment user
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized Action" })
        }

        // Check if already cancelled or completed
        if (appointmentData.cancelled) {
            return res.json({ success: false, message: "Appointment is already cancelled" })
        }
        if (appointmentData.isCompleted) {
            return res.json({ success: false, message: "Cannot cancel a completed appointment" })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
        //releasing doctor slots

        const docId = appointmentData.docId
        const slotDate = appointmentData.slotDate
        const slotTime = appointmentData.slotTime

        const doctorData = await doctorModel.findById(docId)
        let slots_booked = doctorData.slots_booked

        if (slots_booked && slots_booked[slotDate]) {
            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
            await doctorModel.findByIdAndUpdate(docId, { slots_booked })
        }

        res.json({ success: true, message: "Appointment Cancelled" })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

// API to make the payment for appointment

const paymentRazorpay = async (req, res) => {
    try {
        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)
        
        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: "Appointment Not Found or Cancelled" })
        }

        if (appointmentData.payment || appointmentData.isCompleted) {
            return res.json({ success: false, message: "Appointment is already paid or completed" })
        }

        //Creating options for razorpay

        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        //Creation of order
        const order = await razorpayInstance.orders.create(options)
        res.json({ success: true, order })


    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

const verifyRazorpayPayment = async (req, res) => {
    try {
        const { appointmentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: "Appointment Not Found" })
        }

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex')

        if (expectedSignature !== razorpay_signature) {
            return res.json({ success: false, message: "Payment verification failed" })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true, isCompleted: true })
        res.json({ success: true, message: "Payment verified successfully" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: error.message })
    }
}

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpayPayment }