import express from "express";

import authRoute from "./auth.js";
import productRoute from "./product.js";

const userRouter = express.Router();

userRouter.use("/auth", authRoute);
userRouter.use(productRoute);

export default userRouter;
