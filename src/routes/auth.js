import express from "express";
import { login,logout } from "../controllers/authController.js";
const Router=express.Router();
Router.post("/login",login);
Router.get("/logout",logout);
export default Router;