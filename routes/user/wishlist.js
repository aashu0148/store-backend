import express from "express";
import { statusCodes } from "../../utils/constants.js";
import { reqToDbFailed } from "../../utils/utils.js";
import ProductModel from "../../models/Product.js";
import UserModel from "../../models/User.js";
import { authenticateUser } from "../../middlewares/authenticate.js";

const router = express.Router();

router.get("/wishlist", authenticateUser, async (req, res) => {
  const userId = req.currentUser?._id;

  if (!userId) {
    res.status(statusCodes.unauthorized).json({
      status: false,
      message: "Can't authenticate user",
    });
    return;
  }

  const wishlist = req.currentUser?.wishlist || [];
  let result;
  try {
    result = await ProductModel.find({ _id: { $in: wishlist } });
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }
  console.log(result);
  res.status(statusCodes.ok).json({
    status: true,
    message: "Wishlist found",
    data: result,
  });
});

router.get("/wishlist/add/:productId", authenticateUser, async (req, res) => {
  const userId = req.currentUser?._id;
  const productId = req.params?.productId;

  if (!userId) {
    res.status(statusCodes.unauthorized).json({
      status: false,
      message: "Can't authenticate user",
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

  let user;
  try {
    user = await UserModel.findOne({ _id: userId });
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

  if (!user) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: "User not found",
    });
    return;
  }
  user.wishlist = [...(user.wishlist || []), productId];

  user
    .save()
    .then(() => {
      res.status(statusCodes.created).json({
        status: true,
        message: "Product added to wishlist",
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

router.get(
  "/wishlist/delete/:productId",
  authenticateUser,
  async (req, res) => {
    const userId = req.currentUser?._id;
    const productId = req.params?.productId;

    if (!userId) {
      res.status(statusCodes.unauthorized).json({
        status: false,
        message: "Can't authenticate user",
      });
      return;
    }
    if (!productId) {
      res.status(statusCodes.missingInfo).json({
        status: false,
        message: "Wishlist Id not found",
      });
      return;
    }

    let user;
    try {
      user = await UserModel.findOne({ _id: userId });
    } catch (err) {
      reqToDbFailed(res, err);
      return;
    }

    if (!user) {
      res.status(statusCodes.invalidDataSent).json({
        status: false,
        message: "User not found",
      });
      return;
    }

    const tempWishlist = [...(user.wishlist || [])];
    const index = tempWishlist.findIndex((item) => item === productId);
    if (index >= 0) {
      tempWishlist.splice(index, 1);
    } else {
      res.status(statusCodes.invalidDataSent).json({
        status: false,
        message: "product not found in wishlist",
      });
      return;
    }
    user.wishlist = tempWishlist;

    user
      .save()
      .then(() => {
        res.status(statusCodes.ok).json({
          status: true,
          message: "Product deleted from wishlist",
        });
      })
      .catch((err) => {
        res.status(statusCodes.somethingWentWrong).json({
          status: false,
          message: "Something went wrong",
          error: err,
        });
      });
  }
);

export default router;
