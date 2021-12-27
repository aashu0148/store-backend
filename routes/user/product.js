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
  const maxPrice = req.query.maximumPrice || "";
  const refCategory = req.query.refCategory || "";
  const refSubCategory = req.query.refSubCategory || "";
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
  if (
    minPrice &&
    parseInt(minPrice) > 0 &&
    maxPrice &&
    parseInt(maxPrice) > 0
  ) {
    filters["$and"] = [
      { price: { $lte: maxPrice } },
      { price: { $gte: minPrice } },
    ];
  } else if (maxPrice && parseInt(maxPrice) > 0) {
    filters.price = { $lte: maxPrice };
  } else if (minPrice && parseInt(minPrice) > 0) {
    filters.price = { $gte: minPrice };
  }
  if (refCategory) {
    filters.refCategory = refCategory;
  }
  if (refSubCategory) {
    filters.refSubCategory = refSubCategory;
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

  let totalProducts;
  try {
    totalProducts = await ProductModel.find(filters, null, {
      sort: sorting,
      limit: pageSize,
      skip: (pageNumber - 1) * pageSize || 0,
    }).populate("refCategory refUnit");
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

  let filtersWithCategories;
  try {
    if (refCategory) {
      const tempFilters = { ...filters };
      if (refSubCategory) delete tempFilters.refSubCategory;
      const tempResult = await ProductModel.aggregate([
        {
          $match: tempFilters,
        },
        {
          $group: {
            _id: { $toObjectId: "$refSubCategory" },
            total: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "subCategory._id",
            as: "category",
          },
        },
        { $sort: { total: -1 } },
      ]);

      filtersWithCategories = tempResult.map((item) => {
        const category = item?.category[0];
        const subCategories = [...category.subCategory];
        const commonSubCategoryId = item._id?.toString();

        const commonSubCategory = subCategories.find(
          (elem) => elem._id == commonSubCategoryId
        );

        return {
          ...item,
          subCategory: commonSubCategory,
        };
      });
    } else {
      const tempResult = await ProductModel.aggregate([
        {
          $match: filters,
        },
        {
          $group: {
            _id: { $toObjectId: "$refCategory" },
            total: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
        { $sort: { total: -1 } },
      ]);

      filtersWithCategories = tempResult.map((item) => ({
        ...item,
        category: { ...item.category[0] },
      }));
    }
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

  res.status(statusCodes.ok).json({
    status: true,
    message: "Products found",
    data: {
      products: {
        data: totalProducts,
        total: totalCount,
      },
      categories: filtersWithCategories,
    },
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
