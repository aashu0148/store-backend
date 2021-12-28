import express from "express";

import authRoute from "./auth.js";
import productRoute from "./product.js";
import orderRoute from "./order.js";
import cartRoute from "./cart.js";
import topSelling from "./topSelling.js";
const userRouter = express.Router();

userRouter.use("/auth", authRoute);
userRouter.use(productRoute);
userRouter.use(orderRoute);
userRouter.use(cartRoute);
userRouter.use(topSelling);

export default userRouter;
