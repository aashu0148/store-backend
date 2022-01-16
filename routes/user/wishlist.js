import express from "express";
import { statusCodes } from "../../utils/constants.js";
import { reqToDbFailed } from "../../utils/utils.js";
import WishlistModel from "../../models/Wishlist.js";
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

  let result;
  try {
    result = await WishlistModel.find({ refUser: userId }).populate(
      "refProduct"
    );
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

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

  const newWishlist = new WishlistModel({
    refUser: userId,
    refProduct: productId,
  });

  newWishlist
    .save()
    .then((response) => {
      res.status(statusCodes.created).json({
        status: true,
        message: "Product added to wishlist",
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

router.get(
  "/wishlist/delete/:wishlistId",
  authenticateUser,
  async (req, res) => {
    const userId = req.currentUser?._id;
    const wishlistId = req.params?.wishlistId;

    if (!userId) {
      res.status(statusCodes.unauthorized).json({
        status: false,
        message: "Can't authenticate user",
      });
      return;
    }
    if (!wishlistId) {
      res.status(statusCodes.missingInfo).json({
        status: false,
        message: "Wishlist Id not found",
      });
      return;
    }

    let result;
    try {
      result = await WishlistModel.findOneAndDelete({
        _id: wishlistId,
        refUser: userId,
      });
    } catch (err) {
      reqToDbFailed(res, err);
      return;
    }

    if (!result) {
      res.status(statusCodes.noDataAvailable).json({
        status: false,
        message: "Wishlist not found",
      });
      return;
    }

    res.status(statusCodes.ok).json({
      status: true,
      message: "Wishlist Deleted",
    });
  }
);

export default router;
