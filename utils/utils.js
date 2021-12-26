import mongoose from "mongoose";
import bcrypt from "bcrypt";

import { emailRegex, mobileRegex, statusCodes } from "./constants.js";
import { avatarLinks } from "./constants.js";
import { mongoUri } from "./secret.js";

export function initaliseDb() {
  mongoose
    .connect(mongoUri, {
      useNewUrlParser: true,
    })
    .then(() => {
      console.log("Established Mongoose Default Connection");
    })
    .catch((err) => {
      console.error("Mongoose Default Connection Error : " + err);
    });
}

export const validateEmail = (email) => {
  if (!email) return false;
  if (emailRegex.test(email.toLowerCase())) return true;
  else return false;
};

export const validateMobile = (mobile) => {
  if (!mobile) return false;
  if (mobileRegex.test(mobile.toLowerCase())) return true;
  else return false;
};

export const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

export const compareHashedPassword = (plainPassword, hashedPassword) => {
  return bcrypt.compareSync(plainPassword, hashedPassword);
};

export const reqToDbFailed = (res, err) => {
  res.status(statusCodes.databaseError).json({
    status: false,
    message: "Error requesting database",
    error: err + "",
  });
};

export const randomNumberBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const generateRandomAvatar = () => {
  const men = randomNumberBetween(0, 1) ? true : false;
  if (men)
    return avatarLinks.men[randomNumberBetween(0, avatarLinks.men.length - 1)];

  return avatarLinks.women[
    randomNumberBetween(0, avatarLinks.women.length - 1)
  ];
};
