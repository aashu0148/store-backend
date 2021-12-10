import mongoose from "mongoose";

const productSchema = mongoose.Schema({
  title: String,
  description: String,
  discount: Number,
  price: Number,
  quantity: Number,
  refCategory: String,
  refUnit: String,
  thumbnail: String,
  images: Array,
  createdAt: Date,
  refCreatedBy: String,
});

const model = mongoose.model("Product", productSchema);

export default model;
