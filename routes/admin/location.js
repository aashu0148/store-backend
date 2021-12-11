import express from "express";

import LocationModel from "../../models/admin/Location.js";
import { pageSize as sizeOfPage, statusCodes } from "../../utils/constants.js";
import { reqToDbFailed } from "../../utils/utils.js";
const router = express.Router();

router.get("/location", async (req, res) => {
  const pageSize = req.query.pageSize
    ? parseInt(req.query.pageSize)
    : sizeOfPage;
  const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;
  const search = req.query.search;

  const filters = {};

  if (search)
    filters["$or"] = [
      { city: new RegExp(search, "i") },
      { state: new RegExp(search, "i") },
      { state: new RegExp(search, "i") },
    ];

  let locations;
  try {
    locations = await LocationModel.find(filters, null, {
      sort: { city: -1 },
      limit: pageSize,
      skip: (pageNumber - 1) * pageSize || 0,
    });
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

  let totalCount;
  try {
    totalCount = await LocationModel.countDocuments(filters);
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

  res.status(statusCodes.ok).json({
    status: true,
    message: "Locations found",
    data: locations,
    total: totalCount,
  });
});

export default router;
