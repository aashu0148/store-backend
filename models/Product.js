import mongoose from "mongoose";

const productSchema = mongoose.Schema({
  title: String,
  description: String,
  availabilities: [
    {
      price: Number,
      quantity: Number,
      discount: Number,
      refUnit: { type: String, ref: "Unit" },
    },
  ],
  noOfProducts: Number,
  refCategory: { type: String, ref: "Category" },
  refSubCategory: { type: String, ref: "Category.subCategory" },
  thumbnail: String,
  images: Array,
  createdAt: Date,
  updatedAt: Date,
  refCreatedBy: { type: String, ref: "User" },
  shelfLife: Number,
  storageTemperature: Number,
  benefits: String,
  storageTips: String,
});

productSchema.index({ refCategory: 1, title: 1 });

const model = mongoose.model("Product", productSchema);

export default model;
