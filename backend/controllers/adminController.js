import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from 'jsonwebtoken';
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";

// API for adding doctor

const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imagefile = req.files?.image?.[0] || req.files?.file?.[0];

        let parsedAddress = address;
        if (typeof parsedAddress === 'string') {
            try {
                parsedAddress = JSON.parse(parsedAddress);
            } catch {
                // keep as string if it is not valid JSON
            }
        }

        const feeValue = Number(fees);

        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !parsedAddress || !imagefile) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields and an image.'
            });
        }

        if (!Number.isFinite(feeValue)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid fee.'
            });
        }

        if(!validator.isEmail(email)){
            return res.json({
                success: false,
                message: 'Please enter valid email.'
            });
        }

        if(password.length < 8){
            return res.json({
                success: false,
                message: 'Please enter STRONG password.'
            });
        }

        //hashing password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Upload image to cloudinary
        const uploadImage = await cloudinary.uploader.upload(imagefile.path, {resource_type:"image"})
        const imageUrl = uploadImage.secure_url

        const doctorData = {
            name,
            email,
            image:imageUrl,
            password:hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fee: feeValue,
            address: parsedAddress,
            date:Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()
        
        res.status(200).json({
            success: true,
            message: 'Doctor added successfully.'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to add doctor.' });
    }
};

//API for admin login
const loginAdmin = async(req, res) => {
    try{
        const {email, password} = req.body

        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password, process.env.JWT_SECRET)
            res.json({success:true, token})
        }else{
            res.json({success:false, message:"Invalid Credentials"})
        }

    }catch(error){
        console.error(error);
        return res.status(500).json({ success: false, message: error.message});
    }
}

//API for getting all doctors
const getAllDoctors = async(req, res) => {
    try{
        const doctors = await doctorModel.find({}).select('-password')
        res.json({success:true, doctors})
    }catch(error){
        console.error(error);
        return res.status(500).json({ success: false, message: error.message});
    }
}

//API to get all appointments

const appointmentsAdmin = async(req, res) => {
    try{
        const appointments = await appointmentModel.find({})
        res.json({success:true, appointments})
    }catch(error){
        console.error(error);
        return res.status(500).json({ success: false, message: error.message});
    }
}   

//API for cancelling appointments

const appointmentCancel = async (req, res) => {
    try {
        const { id, appointmentId } = req.body
        
        const appointmentIdToCancel = id || appointmentId

        if (!appointmentIdToCancel) {
            return res.status(400).json({ success: false, message: 'Appointment ID is required.' });
        }
        
        const appointment = await appointmentModel.findById(appointmentIdToCancel);
        
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found.' });
        }

        if (appointment.cancelled) {
            return res.status(400).json({ success: false, message: 'Appointment is already cancelled.' });
        }

        if (appointment.isCompleted) {
            return res.status(400).json({ success: false, message: 'Cannot cancel a completed appointment.' });
        }
        
        // Mark as cancelled
        appointment.cancelled = true;
        
        // Update appointment status
        appointment.status = 'cancelled';
        appointment.payment = false;
        
        await appointment.save();

        // Release doctor slot
        const { docId, slotDate, slotTime } = appointment;
        const doctorData = await doctorModel.findById(docId);
        if (doctorData) {
            let slots_booked = doctorData.slots_booked;
            if (slots_booked && slots_booked[slotDate]) {
                slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
                await doctorModel.findByIdAndUpdate(docId, { slots_booked });
            }
        }
        
        res.json({ success: true, message: 'Appointment cancelled successfully.', appointment });
        
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ success: false, message: 'Failed to cancel appointment.', error: error.message });
    }
};

//API to get dashboard data for admin panel
const adminDashboard = async(req, res) => {
    try{
        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.slice(-5)
        }

        res.json({success:true, dashData})
        
    }catch(error){
        console.error(error);
        return res.status(500).json({ success: false, message: error.message});
    }
}


export { addDoctor, loginAdmin, getAllDoctors, appointmentsAdmin, appointmentCancel, adminDashboard };