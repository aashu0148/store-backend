import mongoose from "mongoose";

const productSchema = mongoose.Schema({
  title: String,
  description: String,
  discount: Number,
  price: Number,
  quantity: Number,
  refCategory: { type: String, ref: "Category" },
  refSubCategory: { type: String, ref: "Category.subCategory" },
  refUnit: { type: String, ref: "Unit" },
  thumbnail: String,
  images: Array,
  createdAt: Date,
  refCreatedBy: { type: String, ref: "User" },
});

const model = mongoose.model("Product", productSchema);

export default model;
