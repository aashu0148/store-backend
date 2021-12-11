import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
  items: [
    {
      refProduct: { type: String, ref: "Product" },
      refMerchant: { type: String, ref: "User" },
      quantity: Number,
    },
  ],
  createdAt: Date,
  refUser: { type: String, ref: "User" },
  refLocation: { type: String, ref: "Location" },
  streetAddress: String,
  total: Number,
  isDelivered: Boolean,
  isReturned: Boolean,
  isCancelled: Boolean,
});

const model = mongoose.model("Order", orderSchema);

export default model;
