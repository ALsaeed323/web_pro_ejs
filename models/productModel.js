import mongoose from "mongoose";

const Product = mongoose.model(
  "Product",
  new mongoose.Schema(
    {
      name: { type: String, required: true, unique: true },
      slug: { type: String, required: true, unique: true },
      category: { type: String, required: true },
      image: { type: String, required: false },
      price: { type: Number, required: true },
      countInStock: { type: Number, required: true },
      brand: { type: String, required: true },
      description: { type: String, required: true },
    },
    {
      timestamps: true,
    }
  )
);

export default Product;
