import express from "express";

import userRoute from "./user/user.js";
import customerRoute from "./customer/customer.js";
import merchantRoute from "./merchant/merchant.js";
import adminRoute from "./admin/admin.js";

const rootRouter = express.Router();

rootRouter.use("/user", userRoute);
rootRouter.use("/customer", customerRoute);
rootRouter.use("/merchant", merchantRoute);
rootRouter.use("/admin", adminRoute);

export default rootRouter;