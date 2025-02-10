import { compare, hash } from "bcrypt";
import { userModel } from "../Models/UserModel.js";
import { cookieOptions, sendToken } from "../utils/features.js";
import { ErrorHandler } from "../utils/errorHandler.js";

export const login=async(req,res,next)=>{
    try {
        const {username,password}=req.body;
        const user=await userModel.findOne({username}).select("+password");
        if(!user){
           return next(new ErrorHandler("User Not Found."));
        }
       // console.log(user)
        const isCorrect=await compare(password,user.password);
       // console.log(isCorrect)
        if(!isCorrect){
           return next(new ErrorHandler("Incorrect password."));
        }
        sendToken(res,user,200,"Loggedin successfully.")
        
    } catch (error) {
        console.log(error)
    }
}
export const logout=async(req,res,next)=>{
    try {
        return res.status(200).cookie("chattu-token","",{...cookieOptions,maxAge:0}).json({
            success:true,
            message:"Logged out successfully."
        })
    } catch (error) {
        next(error);
    }
}