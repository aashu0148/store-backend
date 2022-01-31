import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  userType: String,
  email: String,
  password: String,
  profileImage: String,
  deliveryAddress: String,
  refLocation: { type: String, ref: "Location" },
  mobile: String,
  authToken: String,
  authToken2: String,
  refCart: String,
  refOrderList: String,
  wishlist: Array,
});

const model = mongoose.model("User", userSchema);

export default model;
