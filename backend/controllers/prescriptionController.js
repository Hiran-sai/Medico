import prescriptionModel from '../models/prescriptionModel.js';
import { extractTextFromPrescription } from '../utils/ocr.js';
import { extractScheduleWithGemini } from '../utils/gemini.js';
import { v2 as cloudinary } from 'cloudinary';

/**
 * Controller to upload a prescription image, run OCR, use Gemini to parse medicine schedules, and save to DB.
 */
export const uploadPrescription = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        if (!userId) {
            return res.json({ success: false, message: "User not authenticated" });
        }

        if (!req.file) {
            return res.json({ success: false, message: "No image file uploaded" });
        }

        // 1. Run OCR (Sharp preprocessing + Tesseract) first
        let extractedText = "";
        try {
            extractedText = await extractTextFromPrescription(req.file.buffer);
        } catch (ocrError) {
            console.error("OCR Error: ", ocrError);
            return res.json({ success: false, message: "Failed to process image for OCR. Please try another image." });
        }

        // 2. Check if OCR text is near-empty (less than 15 characters)
        const cleanText = extractedText ? extractedText.trim() : "";
        if (!cleanText || cleanText.length < 15) {
            return res.json({ success: false, message: "Prescription image is unclear, please try again with a clearer image." });
        }

        // 3. Upload image to Cloudinary
        let imageUrl = "";
        try {
            const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            const imageUpload = await cloudinary.uploader.upload(base64Image, { resource_type: "image" });
            imageUrl = imageUpload.secure_url;
        } catch (uploadError) {
            console.error("Cloudinary Upload Error: ", uploadError);
            return res.json({ success: false, message: "Failed to upload image to cloud storage." });
        }

        // 4. Create prescription record in database with status 'processing'
        const prescription = new prescriptionModel({
            userId,
            imageUrl,
            rawExtractedText: cleanText,
            status: 'processing'
        });
        await prescription.save();

        // 5. Call Gemini API to extract medicines
        try {
            const medicines = await extractScheduleWithGemini(cleanText);
            prescription.medicines = medicines;
            prescription.status = 'completed';
            await prescription.save();

            return res.json({ 
                success: true, 
                message: "Prescription processed successfully", 
                prescription 
            });
        } catch (geminiError) {
            console.error("Gemini Extraction Error: ", geminiError);
            prescription.status = 'failed';
            await prescription.save();

            return res.json({ 
                success: false, 
                message: "Failed to parse medicine schedule from prescription: " + geminiError.message,
                prescription 
            });
        }
    } catch (error) {
        console.error("Internal server error in uploadPrescription: ", error);
        res.status(500).json({ success: false, message: "Internal server error: " + error.message });
    }
};

/**
 * Controller to fetch all prescription schedules for the logged-in user, newest first.
 */
export const getSchedule = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        if (!userId) {
            return res.json({ success: false, message: "User not authenticated" });
        }

        const prescriptions = await prescriptionModel.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, prescriptions });
    } catch (error) {
        console.error("Error in getSchedule: ", error);
        res.status(500).json({ success: false, message: "Internal server error: " + error.message });
    }
};
