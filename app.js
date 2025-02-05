import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/constants/connectionDB.js";
dotenv.config();

const app=express();
app.use(cors());

connectDB();
app.listen(3000,()=>{
    console.log("server started")
})