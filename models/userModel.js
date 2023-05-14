import mongoose from "mongoose";

const User = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      isAdmin: { type: Boolean, default: false, required: true },
      shippingAddress: {
        fullName: { type: String, required: false },
        address: { type: String, required: false },
        city: { type: String, required: false },
        postalCode: { type: String, required: false },
        country: { type: String, required: false },
      },
      paymentMethod: { type: String, required: false },
    },
    {
      timestamps: true,
    }
  )
);
export default User;
