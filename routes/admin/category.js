import express from "express";
import { ObjectId } from "mongodb";

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

router.get("/sub-category/:refCategory", async (req, res) => {
  const categoryRef = req.params.refCategory;

  let category;
  try {
    category = await Category.findOne({ _id: categoryRef });
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

  if (!category) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: "Invalid category id",
    });
  } else if (category?.subCategory?.length) {
    res.status(statusCodes.ok).json({
      status: true,
      message: "Sub categories found",
      data: category?.subCategory,
    });
  } else {
    res.status(statusCodes.noDataAvailable).json({
      status: false,
      message: "Sub categories not found",
    });
  }
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

// router.get("/category/script", async (req, res) => {
//   for (let i = 0; i < categories.length; ++i) {
//     const subCategory = categories[i].subCategory.map((item) => ({
//       _id: new ObjectId(),
//       ...item,
//     }));
//     const newCategory = new Category({
//       name: categories[i].name,
//       subCategory: subCategory,
//       url: categories[i].url,
//     });

//     await newCategory.save();
//     console.log("saving", categories[i].name, "...");
//   }
//   console.log("saved all");
// });

export default router;
