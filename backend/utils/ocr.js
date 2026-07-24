import sharp from 'sharp';
import Tesseract from 'tesseract.js';

/**
 * Preprocesses an image using sharp and extracts its text via Tesseract.js.
 * @param {Buffer} imageBuffer - The raw image buffer.
 * @returns {Promise<string>} The extracted raw text.
 */
export const extractTextFromPrescription = async (imageBuffer) => {
    try {
        // Preprocess image to enhance OCR quality
        const processedImageBuffer = await sharp(imageBuffer)
            .resize(2000) // Upscale/resize to width 2000 while preserving aspect ratio
            .grayscale()  // Convert to grayscale
            .normalize()  // Normalize brightness/contrast
            .sharpen()    // Apply sharpening
            .toBuffer();

        const worker = await Tesseract.createWorker('eng');
        try {
            const { data: { text } } = await worker.recognize(processedImageBuffer);
            return text;
        } finally {
            await worker.terminate();
        }
    } catch (error) {
        console.error("OCR Extraction failed:", error);
        throw new Error("Failed to process image and extract text. Please ensure it is a valid image.");
    }
};
