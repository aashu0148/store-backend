import express from "express";

import ProductModel from "../../models/Product.js";
import { pageSize as sizeOfPage, statusCodes } from "../../utils/constants.js";
import { reqToDbFailed } from "../../utils/utils.js";
const router = express.Router();

router.get("/product/all", async (req, res) => {
  const pageSize = req.query.pageSize
    ? parseInt(req.query.pageSize)
    : sizeOfPage;

  const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;

  let result;
  try {
    result = await ProductModel.find({}, null, {
      sort: { createdAt: -1 },
      limit: pageSize,
      skip: (pageNumber - 1) * pageSize || 0,
    });
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

  let totalCount;
  try {
    totalCount = await ProductModel.count();
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

  res.status(statusCodes.ok).json({
    status: true,
    message: "Products found",
    data: result,
    total: totalCount,
  });
});

router.get("/product/:productId", async (req, res) => {
  const productId = req.params.productId;

  let result;
  try {
    result = await ProductModel.findOne({ _id: productId });
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

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

export default router;
