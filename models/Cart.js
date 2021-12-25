import mongoose from "mongoose";

const cartSchema = mongoose.Schema({
  createdAt: Date,
  userId: String,
  products: Array,
  updatedAt:Date
});

const model = mongoose.model("Cart", cartSchema);

export default model;