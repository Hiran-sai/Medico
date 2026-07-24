import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    imageUrl: { type: String, required: true },
    medicines: [{
        name: { type: String, default: "" },
        dosage: { type: String, default: "" },
        frequency: { type: String, default: "" },
        timings: [{ type: String }],
        duration: { type: String, default: "" },
        instructions: { type: String, default: "" }
    }],
    rawExtractedText: { type: String, default: "" },
    status: { 
        type: String, 
        enum: ['processing', 'completed', 'failed'], 
        default: 'processing' 
    },
    createdAt: { type: Date, default: Date.now }
});

const prescriptionModel = mongoose.models.prescription || mongoose.model('prescription', prescriptionSchema);

export default prescriptionModel;
