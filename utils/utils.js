import mongoose from "mongoose";
import bcrypt from "bcrypt";

import { emailRegex, mobileRegex, statusCodes } from "./constants.js";
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
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return "";
    return hash;
  });
};

export const compareHashedPassword = (plainPassword, hashedPassword) => {
  bcrypt.compare(plainPassword, hashedPassword, (err, result) => {
    if (err) return false;
    return result;
  });
};

export const reqToDbfailed = (res, err) => {
  res.send(statusCodes.databaseError).json({
    status: false,
    message: "Error requesting database",
    error: err,
  });
};
