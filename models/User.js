import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  profileImage: String,
  userType: String,
  email: String,
  password: String,
  deliveryAddress: String,
  deliveryCity: String,
  deliveryState: String,
  mobile: String,
  authToken: String,
  refCart: String,
  refOrderList: String,
});

const model = mongoose.model("User", userSchema);

export default model;
