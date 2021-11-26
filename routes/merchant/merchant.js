import express from "express";

import productRoute from "./product.js";

const merchantRouter = express.Router();

merchantRouter.use(productRoute);

export default merchantRouter;
