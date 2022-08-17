import express from "express";
import { login, register } from "../controllers/authController.js";

const authRouter = express();

authRouter.route("/register").post(register);
authRouter.route("/login").post(login);

export default authRouter;
