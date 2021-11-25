import express from "express";
import authRoute from "./auth.js";

const userRouter = express.Router();

userRouter.use("/auth", authRoute);

export default userRouter;
