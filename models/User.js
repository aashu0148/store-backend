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
  authToken2: String,
  refCart: String,
  refOrderList: String,
  wishlist: Array,
});

const model = mongoose.model("User", userSchema);

export default model;
