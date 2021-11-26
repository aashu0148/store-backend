import express from "express";

import ProductModel from "../../models/Product.js";
import { statusCodes, userTypes } from "../../utils/constants.js";
import { authenticateUser } from "../../middlewares/authenticate.js";
import { reqToDbfailed } from "../../utils/utils.js";
const router = express.Router();

router.post("/product/add", authenticateUser, async (req, res) => {
  const userId = req.currentUser?._id;
  const userType = req.currentUser?.userType;
  const {
    title,
    description,
    refCategory,
    thumbnail,
    images,
    price,
    discount,
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
    !discount ||
    !price ||
    !refCategory ||
    !thumbnail ||
    !images
  ) {
    res.status(statusCodes.missingInfo).json({
      status: false,
      message: `Missing fields - ${title ? "" : title + " "} ${
        description ? "" : description + " "
      } ${price ? "" : price + " "} ${discount ? "" : discount + " "} ${
        refCategory ? "" : refCategory + " "
      } ${thumbnail ? "" : thumbnail + " "} ${images ? "" : images + " "}`,
    });
    return;
  }

  const newProduct = new ProductModel({
    title,
    description,
    discount: parseInt(discount),
    price: parseInt(price),
    refCategory,
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
    thumbnail,
    images,
    price,
    discount,
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
  if (!productId) {
    res.status(statusCodes.missingInfo).json({
      status: false,
      message: "Product Id not found",
    });
    return;
  }

  let result;
  try {
    result = await ProductModel.findOne({ _id: productId });
  } catch (err) {
    reqToDbfailed(res, err);
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
  if (thumbnail) {
    result.thumbnail = thumbnail;
  }
  if (discount) {
    result.discount = parseInt(discount);
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

router.get("/product/delete/:productId", async (req, res) => {
  const productId = req.params.productId;

  let result;
  try {
    result = await ProductModel.findOneAndDelete({ _id: productId });
  } catch (err) {
    reqToDbfailed(res, err);
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
    message: "Product Deleted",
  });
});

export default router;
