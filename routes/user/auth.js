import express from "express";

import {
  compareHashedPassword,
  generateRandomAvatar,
  hashPassword,
  reqToDbFailed,
  validateEmail,
  validateMobile,
} from "../../utils/utils.js";
import { signToken } from "../../utils/authToken.js";
import { statusCodes, userTypes } from "../../utils/constants.js";
import UserModel from "../../models/User.js";
import { authenticateUser } from "../../middlewares/authenticate.js";
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

  let userWithMobile;
  try {
    userWithMobile = await UserModel.findOne({ mobile });
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }
  if (userWithMobile) {
    if (userWithMobile.userType !== userTypes.customer) {
      res.status(statusCodes.invalidDataSent).json({
        status: false,
        message: `Not a customer, signin as merchant`,
      });
      return;
    }

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

  let userWithEmail;
  try {
    userWithEmail = await UserModel.findOne({ email: email.toLowerCase() });
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }
  if (userWithEmail) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: `Email already exists. Try loggin in`,
    });
    return;
  }

  let userWithMobile;
  try {
    userWithMobile = await UserModel.findOne({ mobile });
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }
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
    try {
      user = await UserModel.findOne({ email: email.toLowerCase() });
    } catch (err) {
      reqToDbFailed(res, err);
      return;
    }

    if (!user) {
      res.status(statusCodes.invalidDataSent).json({
        status: false,
        message: `Invalid email, can't find user`,
      });
      return;
    }

    if (user.userType !== userTypes.merchant) {
      res.status(statusCodes.invalidDataSent).json({
        status: false,
        message: `Not a merchant, signin as customer`,
      });
      return;
    }

    const hashedPassword = user.password;
    if (!compareHashedPassword(password, hashedPassword)) {
      res.status(statusCodes.invalidDataSent).json({
        status: false,
        message: `Invalid credentails`,
      });
      return;
    }
  } else {
    try {
      user = await UserModel.findOne({ mobile: mobile }, "-password");
    } catch (err) {
      reqToDbFailed(res, err);
      return;
    }

    if (!user) {
      res.status(statusCodes.invalidDataSent).json({
        status: false,
        message: `Invalid credentails, can't find user`,
      });
      return;
    }

    if (user.userType !== userTypes.customer) {
      res.status(statusCodes.invalidDataSent).json({
        status: false,
        message: `Not a customer, signin as merchant`,
      });
      return;
    }
  }

  const token = signToken({
    id: user._id,
    userType: user.userType,
  });

  user.authToken2 = user.authToken;
  user.authToken = token;

  user
    .save()
    .then(() => {
      res.status(statusCodes.ok).json({
        status: true,
        message: `User found`,
        data: user,
      });
    })
    .catch((err) => {
      res.status(statusCodes.somethingWentWrong).json({
        status: false,
        message: `Error loggin in`,
        error: err,
      });
      return;
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
  let hashedPassword;
  if (isMerchant) hashedPassword = hashPassword(password);
  else hashedPassword = "";

  let userWithEmail;
  try {
    userWithEmail = await UserModel.findOne({ email });
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }
  if (userWithEmail) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: `Email already in use`,
    });
    return;
  }

  let userWithMobile;
  try {
    userWithMobile = await UserModel.findOne({ mobile });
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }
  if (userWithMobile) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: `Mobile number already in use`,
    });
    return;
  }

  const newUser = new UserModel({
    firstName,
    lastName,
    profileImage: generateRandomAvatar(),
    userType: isMerchant ? userTypes.merchant : userTypes.customer,
    email: email.toLowerCase(),
    password: hashedPassword,
    mobile: mobile,
    deliveryAddress: "",
    deliveryCity: "",
    deliveryState: "",
    authToken: "",
    refCart: "",
    refOrderList: "",
    wishlist: [],
  });

  const token = signToken({
    id: newUser._id,
    userType: newUser.userType,
  });
  newUser.authToken = token;
  newUser.authToken2 = token;

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
router.post("/update", authenticateUser, async (req, res) => {
  const {
    firstName,
    lastName,
    isMerchant,
    email,
    password,
    mobile,
    profileImage,
    deliveryAddress,
    refLocation,
  } = req.body;
  if (
    !firstName &&
    !lastName &&
    !email &&
    !mobile &&
    !password &&
    !profileImage &&
    !deliveryAddress &&
    !refLocation
  ) {
    res.status(statusCodes.missingInfo).json({
      status: false,
      message: `Send fields to update`,
    });
    return;
  }

  if (email && !validateEmail(email)) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: `Invalid email`,
    });

    return;
  }

  if (mobile && !validateMobile(mobile)) {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: `Invalid mobile number`,
    });
    return;
  }

  let hashedPassword;
  if (isMerchant && password) hashedPassword = hashPassword(password);

  let user;
  const userId = req.currentUser?._id;
  try {
    user = await UserModel.findOne({ _id: userId });
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

  if (user) {
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (password && isMerchant) user.password = password;
    if (mobile) user.mobile = mobile;
    if (profileImage) user.profileImage = profileImage;
    if (deliveryAddress) user.deliveryAddress = deliveryAddress;
    if (refLocation) user.refLocation = refLocation;

    user
      .save()
      .then(() => {
        res.status(statusCodes.created).json({
          status: true,
          message: `User Details Updated`,
        });
      })
      .catch((err) => {
        res.status(statusCodes.somethingWentWrong).json({
          status: false,
          message: `Error updating user`,
          error: err,
        });
        return;
      });
  } else {
    res.status(statusCodes.somethingWentWrong).json({
      status: false,
      message: `No User Found`,
      error: err,
    });
    return;
  }
});

router.get("/authenticate", authenticateUser, (req, res) => {
  if (req.currentUser?._id) {
    res.status(statusCodes.ok).json({
      status: true,
      message: "User authenticated",
      data: req.currentUser,
    });
  } else {
    res.status(statusCodes.invalidDataSent).json({
      status: false,
      message: "Not authenticated",
    });
  }
});

export default router;
