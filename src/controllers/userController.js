import { ErrorHandler } from "../utils/errorHandler.js";
import { uploadFilesToCloudinary } from "../utils/cloudinary.js";
import { userModel } from "../Models/UserModel.js";
import { sendToken } from "../utils/features.js";
export const newUser=async(req,res,next)=>{
    try {
        const {name,username,password,bio}=req.body
        const file=req.file;
        if(!file) return next(new ErrorHandler("Please Upload Avatar."));
        const result = await uploadFilesToCloudinary([file]);

        const avatar = {
          public_id: result[0].public_id,
          url: result[0].url,
        };
      
        const user = await userModel.create({
          name,
          bio,
          username,
          password,
          avatar,
        });
      console.log(user)
        sendToken(res, user, 201, "User created");

    } catch (error) {
        console.log( error);

        
    }
}
export const getMyProfile=async(req,res,next)=>{
  try {
    const user=await userModel.findById(req.user);
    if(!user){
      next(new ErrorHandler("User Not Found",404));
    }
    return res.status(200).json({
      success:true,
      user:user
    })
  } catch (error) {
   next(error); 
  }
}