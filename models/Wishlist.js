import mongoose from "mongoose";

const wishlistSchema = mongoose.Schema({
  refUser: { type: String, ref: "User" },
  refProduct: { type: String, ref: "Product" },
});

const model = mongoose.model("Wishlist", wishlistSchema);

export default model;
