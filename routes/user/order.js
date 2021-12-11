import express from "express";

import { authenticateUser } from "../../middlewares/authenticate.js";
import OrderModel from "../../models/Order.js";
import ProductModel from "../../models/Product.js";
import { pageSize as sizeOfPage, statusCodes } from "../../utils/constants.js";
import { reqToDbFailed } from "../../utils/utils.js";
const router = express.Router();

router.get("/order", authenticateUser, async (req, res) => {
  const userId = req.currentUser?._id;
  const pageSize = req.query.pageSize
    ? parseInt(req.query.pageSize)
    : sizeOfPage;

  const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;

  if (!userId) {
    res.status(statusCodes.unauthorized).json({
      status: false,
      message: "Authorization failed",
    });
    return;
  }

  let result;
  try {
    result = await OrderModel.find({ refUser: userId }, null, {
      sort: { createdAt: -1 },
      limit: pageSize,
      skip: (pageNumber - 1) * pageSize || 0,
    }).populate("items.refProduct refLocation");
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

  let totalCount;
  try {
    totalCount = await OrderModel.countDocuments({ refUser: userId });
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

  res.status(statusCodes.ok).json({
    status: true,
    message: "Orders found",
    data: result,
    total: totalCount,
  });
});

router.post("/order/add", authenticateUser, async (req, res) => {
  const userId = req.currentUser?._id;

  if (!userId) {
    res.status(statusCodes.unauthorized).json({
      status: false,
      message: "Authorization failed",
    });
    return;
  }
  const { items, refLocation, streetAddress } = req.body;

  if (!Array.isArray(items) || !streetAddress || !refLocation) {
    res.status(statusCodes.missingInfo).json({
      status: false,
      message: `Missing fields - ${Array.isArray(items) ? "" : "items"} ${
        streetAddress ? "" : "streetAddress"
      } ${refLocation ? "" : "refLocation"}`,
    });
    return;
  }
  if (items.length == 0) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: "items must have values",
    });
    return;
  }

  const requiredItems = items.map((item) => ({
    refProduct: item.refProduct,
    refMerchant: item.refMerchant,
    quantity: item.quantity,
  }));

  let products;
  try {
    products = await ProductModel.find({
      _id: { $in: requiredItems.map((item) => item.refProduct) },
    });
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

  if (products.map.length == 0) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: "No products found with given product ids",
    });
    return;
  }

  const totalAmount = products.reduce(
    (prev, curr) =>
      prev + parseInt(curr.price - (curr.discount / 100) * curr.price),
    0
  );

  const newOrder = new OrderModel({
    items: requiredItems,
    createdAt: new Date(),
    refUser: userId,
    total: totalAmount,
    isDelivered: false,
    isReturned: false,
    isCancelled: false,
    streetAddress,
    refLocation,
  });

  newOrder
    .save()
    .then((response) => {
      res.status(statusCodes.created).json({
        status: true,
        message: "Order created",
        data: response,
      });
    })
    .catch((err) => {
      res.status(statusCodes.somethingWentWrong).json({
        status: false,
        message: "Something went wrong",
        error: err,
      });
    });
});

export default router;
