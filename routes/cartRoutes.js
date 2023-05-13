import express from "express";
import Product from "../models/productModel.js";

const cartRouter = express.Router();

function addToCart(product, cart) {
  if (!cart) {
    cart = [];
  }
  const cartItem = cart.find((p) => p._id === product._id.toString());
  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    cart.push({
      name: product.name,
      _id: product._id,
      image: product.image,
      price: product.price,
      countInStock: product.countInStock,
      quantity: 1,
    });
  }
}

cartRouter.post("/add", async (req, res) => {
  const _id = req.body.id;
  const product = await Product.find({ _id });
  addToCart(product[0], req.session.cart);
  res.send({ message: "Product added to cart", cart: req.session.cart });
});
cartRouter.delete("/remove", (req, res) => {
  const itemId = req.body.id;
  if (!itemId) {
    return res.status(400).send({ message: "Item ID is required" });
  }
  const initialCartSize = req.session.cart.length;
  req.session.cart = req.session.cart.filter((p) => p._id !== itemId);
  if (initialCartSize === req.session.cart.length) {
    return res.status(404).send({ message: "Item not found in the cart" });
  }
  res.status(200).send({ message: "Item removed" });
});
cartRouter.put("/update", (req, res) => {
  const quantity = req.body.quantity;
  const itemId = req.body.id;
  if (!itemId) {
    return res.status(400).send({ message: "Item ID is required" });
  }
  req.session.cart.forEach((p) => {
    if (p._id === itemId) {
      p.quantity += quantity;
    }
  });
  res.status(200).send({ message: "Item added" });
});

export default cartRouter;
