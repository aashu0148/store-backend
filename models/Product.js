import mongoose from "mongoose";

const productSchema = mongoose.Schema({
  title: String,
  description: String,
  discount: Number,
  price: Number,
  refCategory: String,
  thumbnail: String,
  images: Array,
});

const model = mongoose.model("Product", productSchema);

export default model;
