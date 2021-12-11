import express from "express";

import authRoute from "./auth.js";
import productRoute from "./product.js";
import orderRoute from "./order.js";

const userRouter = express.Router();

userRouter.use("/auth", authRoute);
userRouter.use(productRoute);
userRouter.use(orderRoute);

export default userRouter;
