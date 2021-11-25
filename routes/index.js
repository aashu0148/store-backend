import express from "express";

import userRoute from "./user/user.js";
import customerRoute from "./customer/customer.js";
import merchantRoute from "./merchant/merchant.js";

const rootRouter = express.Router();

rootRouter.use("/user", userRoute);
rootRouter.use("/customer", customerRoute);
rootRouter.use("/merchant", merchantRoute);

export default rootRouter;
