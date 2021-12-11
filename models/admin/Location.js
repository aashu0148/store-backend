import mongoose from "mongoose";

const locationSchema = mongoose.Schema({
  city: String,
  state: String,
  county: String,
});

const model = mongoose.model("Location", locationSchema);

export default model;
