import UserModel from "../models/User.js";
import { verifyToken } from "../utils/authToken.js";
import { statusCodes } from "../utils/constants.js";

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.authorization;
    if (!token) {
      res.status(statusCodes.missingInfo).json({
        status: false,
        message: "Authorization failed, token not found.",
      });
      return;
    }

    const result = verifyToken(token);
    if (!result) {
      res.status(statusCodes.invalidDataSent).json({
        status: false,
        message: "Authorization failed, invalid token.",
      });
      return;
    }

    const id = result.id;
    const user = await UserModel.findOne({ _id: id });
    if (!user) {
      res.status(statusCodes.invalidDataSent).json({
        status: false,
        message: "Authorization failed, user not found",
      });
      return;
    }
    if (user.authTokem !== token) {
      res.status(statusCodes.pageNotFound).json({
        status: false,
        message: "Logged in to some other device, need to login again",
      });
      return;
    }
    req.currentUser = user;

    next();
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: err,
    });
  }
};

export { authenticateUser };
