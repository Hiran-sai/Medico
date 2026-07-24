import express from 'express';
import cors from 'cors';
import 'dotenv/config';
// import path from 'path';
// import { fileURLToPath } from 'url';
import connectDB from './config/mongodb.js';
import mongoose from 'mongoose';
import doctorRouter from './routes/doctorRoute.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

import cloudinaryConfig from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import userRouter from './routes/userRoute.js';
import prescriptionRouter from './routes/prescriptionRoute.js';

const app = express();
const port = process.env.PORT || 4000;
connectDB();
cloudinaryConfig();

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//api endpoints
app.use('/api/admin', adminRouter)
// localhost:4000/api/admin/add-doctor

app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)
app.use('/api/prescription', prescriptionRouter)

app.get('/', (req, res) => {
    res.send('API is running...');
})

// // Serve static assets for Admin site under /admin
// app.use('/admin', express.static(path.join(__dirname, '../admin/dist')));

// // Serve static assets for Frontend site under /
// app.use(express.static(path.join(__dirname, '../frontend/dist')));

// // SPA fallback for Admin site
// app.get('/admin/*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../admin/dist/index.html'));
// });

// // SPA fallback for Frontend site
// app.get('/*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
// });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})