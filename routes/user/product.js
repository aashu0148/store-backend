import express from "express";

import ProductModel from "../../models/Product.js";
import { pageSize as sizeOfPage, statusCodes } from "../../utils/constants.js";
const router = express.Router();

router.get("/product/:productId", async (req, res) => {
  const productId = req.params.productId;

  const result = await ProductModel.findOne({ _id: productId });

  if (!result) {
    res.status(statusCodes.noDataAvailable).json({
      status: false,
      message: "No product found",
    });
    return;
  }

  res.status(statusCodes.ok).json({
    status: true,
    message: "Product found",
    data: result,
  });
});

router.get("/product/all", async (req, res) => {
  const pageSize = req.query.pageSize
    ? parseInt(req.query.pageSize)
    : sizeOfPage;

  const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;

  const result = await ProductModel.find({}, null, {
    sort: { createdAt: -1 },
    limit: pageSize,
    skip: pageNumber - 1 * pageSize || 0,
  });

  const totalCount = await ProductModel.count();

  res.status(statusCodes.ok).json({
    status: true,
    message: "Products found",
    data: result,
    total: totalCount,
  });
});

export default router;
