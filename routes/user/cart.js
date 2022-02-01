import express from "express";

import { authenticateUser } from "../../middlewares/authenticate.js";
import CartModel from "../../models/Cart.js";
import { statusCodes } from "../../utils/constants.js";
import { reqToDbFailed } from "../../utils/utils.js";

const router = express.Router();

router.post("/cart/update", authenticateUser, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.currentUser?._id;
  if (!userId) {
    res.status(statusCodes.unauthorized).json({
      status: false,
      message: "Authorization failed",
    });
    return;
  }

  let result,
    product = [];
  try {
    result = await CartModel.findOne({ userId: userId });
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

  if (!result) {
    if (parseInt(quantity) === -1) {
      res.status(statusCodes.noDataAvailable).json({
        status: false,
        message: "No products found",
      });
      return;
    }
    product.push({
      refProduct: productId,
      quantity: quantity,
    });

    const newCart = new CartModel({
      products: product,
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    result = newCart;
  } else {
    let index = result?.products?.findIndex(
      (x) => x.refProduct?.toString() === productId
    );
    if (index > -1) {
      if (parseInt(quantity) === -1) {
        result.splice(index, 1);
      } else {
        result.products[index].quantity = quantity;
        result.updatedAt = new Date();
      }
    } else {
      result.products.push({
        refProduct: productId,
        quantity: quantity,
      });
      result.updatedAt = new Date();
    }
  }

  result
    .save()
    .then((response) => {
      res.status(statusCodes.created).json({
        status: true,
        message: "Item(s) added to cart",
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

router.get("/cart", authenticateUser, async (req, res) => {
  const userId = req.currentUser?._id;
  if (!userId) {
    res.status(statusCodes.unauthorized).json({
      status: false,
      message: "Authorization failed",
    });
    return;
  }

  let result;
  try {
    result = await CartModel.findOne({ userId: userId }).populate(
      "products.refProduct products.refProduct.availabilities.refUnit"
    );
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

  if (!result) {
    res.status(statusCodes.noDataAvailable).json({
      status: false,
      message: "No products found",
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
