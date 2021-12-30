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
    availabilities,
    noOfProducts,
    shelfLife,
    storageTemperature,
    benefits,
    storageTips,
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

  if (
    !title ||
    !description ||
    !refCategory ||
    !refSubCategory ||
    !thumbnail ||
    !Array.isArray(images) ||
    !refUnit ||
    !Array.isArray(availabilities) ||
    !noOfProducts ||
    !shelfLife
  ) {
    res.status(statusCodes.missingInfo).json({
      status: false,
      message: `Missing fields - ${title ? "" : "title" + " "} ${
        description ? "" : "description" + " "
      } ${Array.isArray(availabilities) ? "" : "availabilities" + " "} ${
        noOfProducts ? "" : "noOfProducts" + " "
      } ${refCategory ? "" : "refCategory" + " "} ${
        refSubCategory ? "" : "refSubCategory" + " "
      }${refUnit ? "" : "refUnit" + " "} ${
        thumbnail ? "" : "thumbnail" + " "
      } ${Array.isArray(images) ? "" : "images" + " "} ${
        shelfLife ? "" : "shelfLife" + " "
      }`,
    });
    return;
  }

  const newProduct = new ProductModel({
    title,
    description,
    noOfProducts: parseInt(noOfProducts) || 0,
    availabilities,
    refCategory,
    refSubCategory,
    refUnit,
    thumbnail,
    images,
    createdAt: new Date(),
    updatedAt: new Date(),
    refCreatedBy: userId,
    shelfLife,
    storageTemperature: storageTemperature || "",
    benefits: benefits || "",
    storageTips: storageTips || "",
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
    availabilities,
    noOfProducts,
    shelfLife,
    storageTemperature,
    benefits,
    storageTips,
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

  if (noOfProducts && parseInt(noOfProducts) < 1) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: "Minimum noOfProducts can only be 1",
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
  if (noOfProducts) {
    result.noOfProducts = parseInt(noOfProducts);
  }
  if (Array.isArray(availabilities)) {
    result.availabilities = availabilities;
  }
  if (images) {
    result.images = images;
  }
  if (shelfLife) {
    result.shelfLife = shelfLife;
  }
  if (storageTemperature) {
    result.storageTemperature = storageTemperature;
  }
  if (storageTips) {
    result.storageTips = storageTips;
  }
  if (benefits) {
    result.benefits = benefits;
  }
  result.updatedAt = new Date();

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
