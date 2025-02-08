import { compare, hash } from "bcrypt";
import { userModel } from "../Models/UserModel.js";
import { sendToken } from "../utils/features.js";
import { ErrorHandler } from "../utils/errorHandler.js";

export const login=async(req,res,next)=>{
    try {
        const {username,password}=req.body;
        const user=await userModel.findOne({username}).select("+password");
        if(!user){
            next(new ErrorHandler("User Not Found."));
        }
        const isCorrect=await compare(user.password,password);
        if(!isCorrect){
            next(new ErrorHandler("Incorrect password."));
        }
        sendToken(res,user,200,"Loggedin successfully.")
        
    } catch (error) {
        console.log(error)
    }
}