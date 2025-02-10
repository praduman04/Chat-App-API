import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/constants/connectionDB.js";
import userRoutes from "./src/routes/user.js";
import authRoutes from "./src/routes/auth.js";
import chatRoutes from "./src/routes/chat.js";
import { errorMiddleware } from "./src/middlewares/errorMiddleware.js";
import cookieParser from "cookie-parser";
dotenv.config();

const app=express();
app.use(cors());
app.use(express.json());
app.use(cookieParser())
app.use("/api/v1/user",userRoutes)
app.use("/api/v1/auth",authRoutes)
app.use("/api/v1/chat",chatRoutes)
connectDB();
app.use(errorMiddleware)
app.listen(3000,()=>{
    console.log("server started")
})