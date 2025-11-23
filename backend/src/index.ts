import express from "express";
import authRoutes from "./routes/authRoute";
import dotenv from "dotenv";
import { connectDB } from "./lib/db";

dotenv.config();

const app = express();

const port = process.env.PORT || 3001;

app.use(express.json());
app.use("/api/auth", authRoutes);


app.listen(port, () =>{
    console.log(`Server is running @${port} port`);
    connectDB();
})