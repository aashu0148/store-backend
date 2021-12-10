import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
  name: String,
  examples: Array,
  url: String,
});

const model = mongoose.model("Category", categorySchema);

export default model;
