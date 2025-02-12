import mongoose from "mongoose";
const messageSchema=new mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    attachments:[{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            require:true,
        }
    }],
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    chat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Chat",
        required:true
    },

},{timestamps:true});
export const messageModel=mongoose.model("Message",messageSchema);