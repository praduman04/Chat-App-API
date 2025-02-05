import mongoose from "mongoose";
const requestSchema=new mongoose.Schema({
   
    statuse:{
        type:String,
        required:true
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }

},{timestamps:true});
export const requestModel=mongoose.model("Request",requestSchema);