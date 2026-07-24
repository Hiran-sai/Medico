import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import appointmentModel from "../models/appointmentModel.js";


const changeAvailability = async(req, res) => {
    try{
        const {docId} = req.body

        const docData = await doctorModel.findById(docId)
        if (!docData) {
            return res.json({success: false, message: "Doctor not found"})
        }
        await doctorModel.findByIdAndUpdate(docId, {available: !docData.available})
        res.json({success:true, message:"Availability changed successfully"})
        
    }catch(error){
        console.error(error);
        return res.status(500).json({ success: false, message: error.message});
    }
}

const doctorList = async(req, res) => {
    try{
        const doctors = await doctorModel.find({}).select(["-password", "-email"])
        res.json({success:true, doctors})
    }catch(error){
        console.error(error);
        return res.status(500).json({ success: false, message: error.message});
    }
}

//API for doctor login

const loginDoctor = async(req, res) => {
    try{
        const {email, password} = req.body
        const doctor = await doctorModel.findOne({email})
        if(!doctor){
            return res.json({success:false, message:"Doctor not found"})
        }
        const isMatch = await bcrypt.compare(password, doctor.password)
        if(!isMatch){
            return res.json({success:false, message:"Invalid password"})
        }
        const token = jwt.sign({id: doctor._id}, process.env.JWT_SECRET, {expiresIn: "1d"})
        res.json({success:true, token})
    }catch(error){
        console.error(error);
        return res.status(500).json({ success: false, message: error.message});
    }
}

//API to get doctor appointments for doctor panel

const appointmentsDoctor = async(req, res) => {
    try{
        const doctorId = req.doctorId || req.body?.doctorId || req.body?.doctor_id

        if (!doctorId) {
            return res.status(400).json({ success: false, message: "Doctor ID is required" })
        }

        const appointments = await appointmentModel.find({ docId: doctorId }).sort({ date: -1 })
        res.json({ success: true, appointments })
    }catch(error){
        console.error(error);
        return res.status(500).json({ success: false, message: error.message});
    }
}

// API to mark appointment as completed
const appointmentComplete = async (req, res) => {
    try {
        const doctorId = req.doctorId
        const { appointmentId } = req.body

        const appointment = await appointmentModel.findById(appointmentId)

        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found.' })
        }

        if (appointment.docId !== doctorId) {
            return res.json({ success: false, message: 'Unauthorized Action.' })
        }

        if (appointment.cancelled) {
            return res.json({ success: false, message: 'Cannot complete a cancelled appointment.' })
        }

        appointment.isCompleted = true
        await appointment.save()

        res.json({ success: true, message: 'Appointment Completed' })
    } catch (error) {
        console.error('Error completing appointment:', error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// API to cancel appointment from doctor panel
const appointmentCancel = async (req, res) => {
    try {
        const doctorId = req.doctorId
        const { appointmentId } = req.body

        const appointment = await appointmentModel.findById(appointmentId)

        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found.' })
        }

        if (appointment.docId !== doctorId) {
            return res.json({ success: false, message: 'Unauthorized Action.' })
        }

        if (appointment.cancelled) {
            return res.json({ success: false, message: 'Appointment is already cancelled.' })
        }

        if (appointment.isCompleted) {
            return res.json({ success: false, message: 'Cannot cancel a completed appointment.' })
        }

        appointment.cancelled = true
        await appointment.save()

        // release doctor slot
        const { slotDate, slotTime } = appointment
        const doctorData = await doctorModel.findById(doctorId)
        let slots_booked = doctorData.slots_booked
        if (slots_booked && slots_booked[slotDate]) {
            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
            await doctorModel.findByIdAndUpdate(doctorId, { slots_booked })
        }

        res.json({ success: true, message: 'Appointment Cancelled' })
    } catch (error) {
        console.error('Error cancelling appointment:', error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// API to get doctor profile for doctor panel
const doctorProfile = async (req, res) => {
    try {
        const doctorId = req.doctorId
        const profileData = await doctorModel.findById(doctorId).select('-password')
        res.json({ success: true, profileData })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// API to update doctor profile from doctor panel
const updateDoctorProfile = async (req, res) => {
    try {
        const doctorId = req.doctorId
        const { fees, address, available, about } = req.body

        let parsedAddress = address
        if (typeof parsedAddress === 'string') {
            try {
                parsedAddress = JSON.parse(parsedAddress)
            } catch {
                // keep as string
            }
        }

        await doctorModel.findByIdAndUpdate(doctorId, {
            fee: Number(fees),
            address: parsedAddress,
            available,
            about
        })

        res.json({ success: true, message: 'Profile Updated' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
    try {
        const doctorId = req.doctorId
        const appointments = await appointmentModel.find({ docId: doctorId })

        let earnings = 0
        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })

        let patients = []
        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }

        res.json({ success: true, dashData })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

export {
    changeAvailability,
    doctorList,
    loginDoctor,
    appointmentsDoctor,
    appointmentComplete,
    appointmentCancel,
    doctorProfile,
    updateDoctorProfile,
    doctorDashboard
};