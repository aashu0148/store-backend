import jwt from "jsonwebtoken";
import { jwtSecret } from "./secret.js";

export const signToken = (payload) => {
  const token = jwt.sign(payload, jwtSecret, {
    expiresIn: "7d",
  });
  return token;
};

export const verifyToken = (token) => {
  jwt.verify(token, jwtSecret, (err, verifiedJwt) => {
    if (err) return false;
    else return verifiedJwt;
  });
};
