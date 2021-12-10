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

  const filters = {};
  const sorting = {};
  const searchQuery = req.query.search || "";
  const discount = req.query.discount || "";
  const minPrice = req.query.minimumPrice || "";
  const refCategory = req.query.refCategory || "";
  const refCreatedBy = req.query.refCreatedBy || "";
  const sortBy = req.query.sortBy || "";

  if (searchQuery) {
    filters.title = {
      $regex: new RegExp(searchQuery?.split(" ")?.join("|"), "i"),
    };
  }
  if (discount && parseInt(discount) < 100) {
    filters.discount = { $gte: discount };
  }
  if (minPrice && parseInt(minPrice) > 0) {
    filters.price = { $lte: price };
  }
  if (refCategory) {
    filters.refCategory = refCategory;
  }
  if (refCreatedBy) {
    filters.refCreatedBy = refCreatedBy;
  }

  switch (sortBy) {
    case "price-a": {
      sorting.price = 1;
      break;
    }
    case "price-d": {
      sorting.price = -1;
      break;
    }
    case "discount": {
      sorting.discount = -1;
      break;
    }
    default:
      sorting.createdAt = -1;
  }

  let result;
  try {
    result = await ProductModel.find(filters, null, {
      sort: sorting,
      limit: pageSize,
      skip: (pageNumber - 1) * pageSize || 0,
    });
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

  let totalCount;
  try {
    totalCount = await ProductModel.countDocuments(filters);
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
