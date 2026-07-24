import dns from "dns";
import mongoose from "mongoose";

const connectDB = async () => {
    // Work around Windows/network DNS that fails Node SRV lookups (querySrv ECONNREFUSED)
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
    mongoose.connection.on("connected", () => console.log("Database connected"));
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/medico`);
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    }
}
export default connectDB;