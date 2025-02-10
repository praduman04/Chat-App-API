import mongoose from "mongoose";
const chatSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    groupChat:{
        type:Boolean,
        required:true,
        
    },
    creator:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    members:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },]
},{timestamps:true});
export const chatModel=mongoose.model("Chat",chatSchema)
