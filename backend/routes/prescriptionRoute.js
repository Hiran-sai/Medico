import express from 'express';
import multer from 'multer';
import authUser from '../middlewares/authUser.js';
import { uploadPrescription, getSchedule } from '../controllers/prescriptionController.js';

const prescriptionRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith('image/')) {
            callback(null, true);
        } else {
            callback(new Error('Only image files are allowed'));
        }
    },
});

const handleUpload = (req, res, next) => {
    upload.single('image')(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.json({ success: false, message: 'Image must be smaller than 5 MB.' });
            }
            return res.json({ success: false, message: error.message });
        }
        if (error) {
            return res.json({ success: false, message: error.message });
        }
        next();
    });
};

// POST /api/prescription/upload -> upload prescription image, run OCR and Gemini parsing
prescriptionRouter.post('/upload', authUser, handleUpload, uploadPrescription);

// GET /api/prescription/schedule -> fetch all prescriptions for logged-in user, newest first
prescriptionRouter.get('/schedule', authUser, getSchedule);

export default prescriptionRouter;
