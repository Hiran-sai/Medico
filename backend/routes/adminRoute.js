import express from 'express';
import { addDoctor, loginAdmin, getAllDoctors, appointmentsAdmin, appointmentCancel, adminDashboard } from '../controllers/adminController.js';
import upload from '../middlewares/multer.js';
import authAdmin from '../middlewares/authAdmin.js';
import { changeAvailability } from '../controllers/doctorController.js';


const adminRouter = express.Router();

adminRouter.post(
  '/add-doctor', authAdmin,
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]),
  addDoctor
);

adminRouter.post('/login', loginAdmin)

adminRouter.post('/get-all-doctors', authAdmin, getAllDoctors)

adminRouter.post('/change-availability', authAdmin, changeAvailability)

adminRouter.get('/appointments', authAdmin, appointmentsAdmin)

adminRouter.post('/cancel-appointment', authAdmin, appointmentCancel)

adminRouter.get('/dashboard', authAdmin, adminDashboard)

export default adminRouter