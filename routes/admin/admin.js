import express from "express";

import categoryRoute from "./category.js";
import locationRoute from "./location.js";
import unitRoute from "./unit.js";

const adminRouter = express.Router();

adminRouter.use(categoryRoute);
adminRouter.use(locationRoute);
adminRouter.use(unitRoute);

export default adminRouter;
