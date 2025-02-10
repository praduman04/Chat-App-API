import { isAuthenticated } from "../middlewares/authMiddleware.js";
import express from "express";
import { addMember, getMyChat, getMyGroups, leaveGroup, newGroupChat, removeMember } from "../controllers/chatController.js";
const Router=express.Router();
Router.use(isAuthenticated)
Router.post("/newGroup",newGroupChat);
Router.get("/getMyChats",getMyChat)
Router.get("/getMyGroup",getMyGroups)
Router.patch("/addMembers/:id",addMember)
Router.patch("/removeMember/:id",removeMember)
Router.patch("/leaveGroup/:id",leaveGroup)
export default Router;