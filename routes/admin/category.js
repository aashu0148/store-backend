import express from "express";

import Category from "../../models/admin/Category.js";
import { statusCodes } from "../../utils/constants.js";
import { reqToDbFailed } from "../../utils/utils.js";
const router = express.Router();

router.get("/category", async (req, res) => {
  let categories;
  try {
    categories = await Category.find({});
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

  res.status(statusCodes.ok).json({
    status: true,
    message: "Categories found",
    data: categories,
  });
});

router.post("/category/add", async (req, res) => {
  const { name, examples, url } = req.body;

  if (!name || !Array.isArray(examples) || !url) {
    res.status(statusCodes.missingInfo).json({
      status: false,
      message: `Missing fields - ${name ? "" : "name" + " "}${
        url ? "" : "url"
      } ${!Array.isArray(examples) ? "examples" : ""}`,
    });
    return;
  }

  let newCategory;

  try {
    newCategory = new Category({
      name,
      examples,
      url,
    });
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

  newCategory
    .save()
    .then(() => {
      res.status(statusCodes.created).json({
        status: true,
        message: "Category created",
        data: newCategory,
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
