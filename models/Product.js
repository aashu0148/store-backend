import mongoose from "mongoose";

const productSchema = mongoose.Schema({
  title: String,
  description: String,
  discount: Number,
  price: Number,
  quantityOfProduct: Number,
  noOfProducts: Number,
  refCategory: { type: String, ref: "Category" },
  refSubCategory: { type: String, ref: "Category.subCategory" },
  refUnit: { type: String, ref: "Unit" },
  thumbnail: String,
  images: Array,
  createdAt: Date,
  refCreatedBy: { type: String, ref: "User" },
  shelfLife: Number,
  storageTemperature: Number,
  benefits: String,
  storageTips: String,
});

productSchema.index({ refCategory: 1, title: 1 });

const model = mongoose.model("Product", productSchema);

export default model;
