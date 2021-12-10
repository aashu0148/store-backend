import express from "express";

import Unit from "../../models/admin/unit.js";
import { statusCodes } from "../../utils/constants.js";
import { reqToDbFailed } from "../../utils/utils.js";
const router = express.Router();

router.get("/unit", async (req, res) => {
  let units;
  try {
    units = await Unit.find({});
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

  res.status(statusCodes.ok).json({
    status: true,
    message: "Units found",
    data: units,
  });
});

router.post("/unit/add", async (req, res) => {
  const { name, symbol } = req.body;

  if (!name || !symbol) {
    res.status(statusCodes.missingInfo).json({
      status: false,
      message: `Missing fields - ${name ? "" : "name"} ${
        symbol ? "" : "symbol"
      }`,
    });
    return;
  }

  let newUnit;

  try {
    newUnit = new Unit({
      name,
      symbol,
    });
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

  newUnit
    .save()
    .then(() => {
      res.status(statusCodes.created).json({
        status: true,
        message: "Unit created",
        data: newUnit,
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
