import mongoose from "mongoose";

const unitSchema = mongoose.Schema({
  name: String,
  symbol:String
});

const model = mongoose.model("Unit", unitSchema);

export default model;
