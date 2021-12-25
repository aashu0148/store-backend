import mongoose from "mongoose";

const cartSchema = mongoose.Schema({
  createdAt: Date,
  userId: String,
  products: [ {refProduct: { type: String, ref: "Product" }}],
  updatedAt:Date
});

const model = mongoose.model("Cart", cartSchema);

export default model;