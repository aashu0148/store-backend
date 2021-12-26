import express from "express";

import { avatarLinks, statusCodes } from "../../utils/constants.js";
const router = express.Router();

router.get("/avatar", async (req, res) => {
  res.status(statusCodes.ok).json({
    status: true,
    message: "Avatars found",
    data: avatarLinks,
  });
});

export default router;
