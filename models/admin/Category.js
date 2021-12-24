import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
  name: String,
  subCategory: [Object],
  url: String,
});

const model = mongoose.model("Category", categorySchema);

export default model;
