import express from "express";
import Product from "../models/productModel.js";

const cartRouter = express.Router();

function addToCart(product, cart) {
  // Check if cart exists

  // Check if product already exists in the cart
  const cartItem = cart.find((p) => p._id === product._id.toString());
  if (cartItem) {
    // Check if quantity exceeds stock
    if (cartItem.quantity >= product.countInStock) {
      cartItem.quantity = product.countInStock;
      return;
    }
    // If product exists, increase quantity
    cartItem.quantity += 1;
  } else {
    // If product does not exist, add it to the cart
    cart.push({
      slug: product.slug,
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
  if (!req.session.cart) req.session.cart = [];
  //get product id from request body
  const _id = req.body.id;
  //find product by id
  const product = await Product.find({ _id });
  //add product to cart
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
  // Get item ID and quantity from the request
  const { quantity, id: itemId } = req.body;
  // Check if item ID is provided
  if (!itemId) {
    // Send error message if item ID is not found
    return res.status(400).send({ message: "Item ID is required" });
  }
  // Check if quantity is provided
  req.session.cart.forEach((p) => {
    // Check if item exists in the cart
    if (p._id === itemId) {
      // Check if quantity exceeds stock
      if (p.quantity >= p.countInStock) {
        // Set quantity to stock if quantity exceeds stock
        p.quantity = p.countInStock;
        return;
      }
      // Set quantity to provided quantity
      p.quantity += quantity;
    }
  });
  res.status(200).send({ message: "Item added" });
});

export default cartRouter;
