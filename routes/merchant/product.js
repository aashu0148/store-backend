import express from "express";

import ProductModel from "../../models/Product.js";
import { statusCodes, userTypes } from "../../utils/constants.js";
import { authenticateUser } from "../../middlewares/authenticate.js";
import { reqToDbFailed } from "../../utils/utils.js";
const router = express.Router();

router.post("/product/add", authenticateUser, async (req, res) => {
  const userId = req.currentUser?._id;
  const userType = req.currentUser?.userType;
  const {
    title,
    description,
    refCategory,
    refSubCategory,
    refUnit,
    thumbnail,
    images,
    price,
    discount,
    quantity,
  } = req.body;

  if (userTypes.merchant !== userType) {
    res.status(statusCodes.unauthorized).json({
      status: false,
      message: "Merchant acount needed",
    });
    return;
  }

  if (!userId) {
    res.status(statusCodes.unauthorized).json({
      status: false,
      message: "Authorization failed",
    });
    return;
  }

  if (
    !title ||
    !description ||
    !price ||
    !refCategory ||
    !refSubCategory ||
    !thumbnail ||
    !Array.isArray(images) ||
    !refUnit ||
    !quantity
  ) {
    res.status(statusCodes.missingInfo).json({
      status: false,
      message: `Missing fields - ${title ? "" : "title" + " "} ${
        description ? "" : "description" + " "
      } ${price ? "" : "price" + " "} ${quantity ? "" : "quantity" + " "} ${
        refCategory ? "" : "refCategory" + " "
      } ${refSubCategory ? "" : "refSubCategory" + " "}${
        refUnit ? "" : "refUnit" + " "
      } ${thumbnail ? "" : "thumbnail" + " "} ${
        Array.isArray(images) ? "" : "images" + " "
      }`,
    });
    return;
  }

  if (discount && parseInt(discount) > 99) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: "Maximum discount can only be 99%",
    });
    return;
  }

  const newProduct = new ProductModel({
    title,
    description,
    discount: parseInt(discount) || 0,
    quantity: parseInt(quantity) || 0,
    price: parseInt(price),
    refCategory,
    refSubCategory,
    refUnit,
    thumbnail,
    images,
    createdAt: new Date(),
    refCreatedBy: userId,
  });

  newProduct
    .save()
    .then((response) => {
      res.status(statusCodes.created).json({
        status: true,
        message: "Product created",
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
router.post("/product/update:productId", authenticateUser, async (req, res) => {
  const productId = req.params.productId;
  const userId = req.currentUser?._id;
  const userType = req.currentUser?.userType;
  const {
    title,
    description,
    refCategory,
    refSubCategory,
    refUnit,
    thumbnail,
    images,
    price,
    discount,
    quantity,
  } = req.body;

  if (userTypes.merchant !== userType) {
    res.status(statusCodes.unauthorized).json({
      status: false,
      message: "Merchant account needed",
    });
    return;
  }
  if (!userId) {
    res.status(statusCodes.unauthorized).json({
      status: false,
      message: "Authorization failed",
    });
    return;
  }
  if (!productId) {
    res.status(statusCodes.missingInfo).json({
      status: false,
      message: "Product Id not found",
    });
    return;
  }

  let result;
  try {
    result = await ProductModel.findOne({
      _id: productId,
      refCreatedBy: userId,
    });
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

  if (!result) {
    res.status(statusCodes.noDataAvailable).json({
      status: false,
      message: "Product not found",
    });
    return;
  }

  if (discount && parseInt(discount) >= 100) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: "Max discount can only be 99%",
    });
    return;
  }
  if (quantity && parseInt(quantity) < 1) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: "Minimum quantity can only be 1",
    });
    return;
  }
  if (price && parseInt(price) < 1) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: "Minimum price can only be 1",
    });
    return;
  }

  if (title) {
    result.title = title;
  }
  if (description) {
    result.description = description;
  }
  if (refCategory) {
    result.refCategory = refCategory;
  }
  if (refSubCategory) {
    result.refSubCategory = refSubCategory;
  }
  if (refUnit) {
    result.refUnit = refUnit;
  }
  if (thumbnail) {
    result.thumbnail = thumbnail;
  }
  if (discount) {
    result.discount = parseInt(discount);
  }
  if (quantity) {
    result.quantity = parseInt(quantity);
  }
  if (price) {
    result.price = parseInt(price);
  }
  if (images) {
    result.images = images;
  }
  result
    .save()
    .then((response) => {
      res.status(statusCodes.ok).json({
        status: true,
        message: "Product updated",
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

router.get("/product/delete/:productId", authenticateUser, async (req, res) => {
  const userId = req.currentUser?._id;

  if (!userId) {
    res.status(statusCodes.unauthorized).json({
      status: false,
      message: "Authorization failed",
    });
    return;
  }

  const productId = req.params.productId;

  let result;
  try {
    result = await ProductModel.findOneAndDelete({
      _id: productId,
      refCreatedBy: userId,
    });
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

  if (!result) {
    res.status(statusCodes.noDataAvailable).json({
      status: false,
      message: "Product not found",
    });
    return;
  }

  res.status(statusCodes.ok).json({
    status: true,
    message: "Product Deleted",
  });
});

export default router;
