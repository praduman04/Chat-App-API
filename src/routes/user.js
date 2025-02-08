import express from "express"
import { singleAvatar } from "../middlewares/multer.js";
import { getMyProfile, newUser } from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
const Router=express.Router();
Router.post("/new",singleAvatar,newUser)

Router.get("/myProfile",isAuthenticated,getMyProfile)
export default Router