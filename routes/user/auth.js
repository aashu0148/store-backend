import express from "express";

import {
  hashPassword,
  validateEmail,
  validateMobile,
} from "../../utils/utils.js";
import { signToken } from "../../utils/authToken.js";
import { statusCodes, userTypes } from "../../utils/constants.js";
import UserModel from "../../models/User.js";
const router = express.Router();

router.get("/check-mobile/:mobile", async (req, res) => {
  const mobile = req.params.mobile;

  if (!mobile) {
    res.status(statusCodes.missingInfo).json({
      status: false,
      message: `Missing field - mobile number"
    }`,
    });
    return;
  }
  if (!validateMobile(mobile)) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: `Invalid mobile number`,
    });
    return;
  }

  const userWithMobile = await UserModel.findOne({ mobile });
  if (userWithMobile) {
    res.status(statusCodes.ok).json({
      status: true,
      message: `User with this mobile number exists`,
    });
  } else {
    res.status(statusCodes.noDataAvailable).json({
      status: false,
      message: `Can't find user with this mobile`,
    });
  }
});
router.post("/check-register-details", async (req, res) => {
  const { firstName, lastName, isMerchant, email, password, mobile } = req.body;
  if (isMerchant) {
    if (!firstName || !lastName || !email || !mobile || !password) {
      res.status(statusCodes.missingInfo).json({
        status: false,
        message: `Missing fields - ${firstName ? "" : "first name,"} ${
          lastName ? "" : "last name,"
        } ${mobile ? "" : "mobile number,"} ${password ? "" : "password,"} ${
          email ? "" : "email"
        }`,
      });
      return;
    }
  } else {
    if (!firstName || !lastName || !mobile || !email) {
      res.status(statusCodes.missingInfo).json({
        status: false,
        message: `Missing fields - ${firstName ? "" : "first name,"} ${
          lastName ? "" : "last name,"
        } ${email ? "" : "email,"} ${mobile ? "" : "mobile number"}`,
      });
      return;
    }
  }

  if (!validateEmail(email)) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: `Invalid email`,
    });

    return;
  }
  if (!validateMobile(mobile)) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: `Invalid mobile number`,
    });
    return;
  }

  const hashedPassword = hashPassword(password);

  const userWithEmail = await UserModel.findOne({ email });
  if (userWithEmail) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: `Email already exists. Try loggin in`,
    });
    return;
  }

  const userWithMobile = await UserModel.findOne({ mobile });
  if (userWithMobile) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: `Mobile number already exists. Try loggin in`,
    });
    return;
  }

  res.status(statusCodes.ok).json({
    status: true,
    message: `Valid credentials`,
  });
});

router.post("/login", async (req, res) => {
  const { isMerchant, email, password, mobile } = req.body;
  if (isMerchant) {
    if (!email || !password) {
      res.status(statusCodes.missingInfo).json({
        status: false,
        message: `Missing fields -${password ? "" : "password,"} ${
          email ? "" : "email"
        }`,
      });
      return;
    }
  } else {
    if (!mobile) {
      res.status(statusCodes.missingInfo).json({
        status: false,
        message: `Missing fields - ${mobile ? "" : "mobile number"}`,
      });
      return;
    }
  }

  if (isMerchant && !validateEmail(email)) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: `Invalid email`,
    });

    return;
  }

  if (!isMerchant && !validateMobile(mobile)) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: `Invalid mobile number`,
    });
    return;
  }

  let user;
  if (isMerchant) {
    const hashedPassword = hashPassword(password);

    user = await UserModel.findOne(
      { email: email, password: hashedPassword },
      "-password"
    );
  } else {
    user = await UserModel.findOne({ mobile: mobile }, "-password");
  }

  if (!user) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: `Invalid credentails, can't find user`,
    });
    return;
  }

  res.status(statusCodes.ok).json({
    status: true,
    message: `User found`,
    data: user,
  });
});

router.post("/register", async (req, res) => {
  const { firstName, lastName, isMerchant, email, password, mobile } = req.body;
  if (isMerchant) {
    if (!firstName || !lastName || !email || !mobile || !password) {
      res.status(statusCodes.missingInfo).json({
        status: false,
        message: `Missing fields - ${firstName ? "" : "first name,"} ${
          lastName ? "" : "last name,"
        } ${mobile ? "" : "mobile number,"} ${password ? "" : "password,"} ${
          email ? "" : "email"
        }`,
      });
      return;
    }
  } else {
    if (!firstName || !lastName || !mobile || !email) {
      res.status(statusCodes.missingInfo).json({
        status: false,
        message: `Missing fields - ${firstName ? "" : "first name,"} ${
          lastName ? "" : "last name,"
        } ${email ? "" : "email,"} ${mobile ? "" : "mobile number"}`,
      });
      return;
    }
  }

  if (!validateEmail(email)) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: `Invalid email`,
    });

    return;
  }
  if (!validateMobile(mobile)) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: `Invalid mobile number`,
    });
    return;
  }

  const hashedPassword = hashPassword(password);

  const userWithEmail = await UserModel.findOne({ email });
  if (userWithEmail) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: `Email already exists. Try loggin in`,
    });
    return;
  }

  const userWithMobile = await UserModel.findOne({ mobile });
  if (userWithMobile) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: `Mobile number already exists. Try loggin in`,
    });
    return;
  }

  const newUser = new UserModel({
    firstName,
    lastName,
    userType: isMerchant ? userTypes.merchant : userTypes.customer,
    email: email,
    password: hashedPassword,
    mobile: mobile,
    deliveryAddress: "",
    deliveryCity: "",
    deliveryState: "",
    authToken: "",
    refCart: "",
    refOrderList: "",
  });

  const token = signToken({
    id: newUser._id,
  });
  newUser.authToken = token;

  newUser
    .save()
    .then((response) => {
      res.status(statusCodes.created).json({
        status: true,
        message: `New user created`,
        data: response,
      });
    })
    .catch((err) => {
      res.status(statusCodes.somethingWentWrong).json({
        status: false,
        message: `Error creating user`,
        error: err,
      });
      return;
    });
});

export default router;
