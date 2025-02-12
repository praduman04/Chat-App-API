import { isAuthenticated } from "../middlewares/authMiddleware.js";
import express from "express";
import { addMember, deleteChat, getChatDetails, getMyChat, getMyGroups, leaveGroup, newGroupChat, removeMember, renameGroup, sendAttachments } from "../controllers/chatController.js";
import { attachmentsMulter } from "../middlewares/multer.js";
const Router=express.Router();
Router.use(isAuthenticated)
Router.post("/newGroup",newGroupChat);
Router.get("/getMyChats",getMyChat)
Router.get("/getMyGroup",getMyGroups)
Router.patch("/addMembers/:id",addMember)
Router.patch("/removeMember/:id",removeMember)
Router.patch("/leaveGroup/:id",leaveGroup)
Router.post("/sendAttachments/:id",attachmentsMulter,sendAttachments)
Router.get("/:id",getChatDetails)
Router.patch("/:id",renameGroup)
Router.delete("/:id",deleteChat)

export default Router;