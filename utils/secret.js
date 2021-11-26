import dotenv from "dotenv";
dotenv.config();

export const mongoUri = process.env.MONGO_URI;
export const PORT = process.env.PORT || 5000;
export const jwtSecret = process.env.JWT_SECRET;
