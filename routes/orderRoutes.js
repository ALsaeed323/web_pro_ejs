import express from "express";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

const orderRouter = express.Router();

orderRouter.post("/", async (req, res) => {
  const newOrder = new Order({
    orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
    shippingAddress: req.body.user.shippingAddress,
    paymentMethod: req.body.user.paymentMethod,
    itemsPrice: req.body.itemsPrice,
    shippingPrice: req.body.shippingPrice,
    taxPrice: req.body.taxPrice,
    totalPrice: req.body.totalPrice,
    user: req.body.user._id,
  });
  const order = await newOrder.save();
  req.session.cart = [];
  res.send({ message: "New Order Created", id: order._id });
});

orderRouter.get("/mine", async (req, res) => {
  try {
    const orders = await Order.find({ user: req.session.user._id });
    const cats = await Product.find().distinct("category"); //["Pants,Shitrs","Hoodie"]
    res.render("pages/route", {
      path: "orders", //the path that user entered
      title: 'My Orders', //the title of the page
      cats, //the categories
      user: req.session.user, //the user
      cart: req.session.cart, //the cart
      orders,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Internal server error" });
  }
});



orderRouter.get("/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    const cats = await Product.find().distinct("category"); //["Pants,Shitrs","Hoodie"]
    res.render("pages/route", {
      path: "order", //the path that user entered
      title: `Order ${order._id}`, //the title of the page
      cats, //the categories
      user: req.session.user, //the user
      cart: req.session.cart, //the cart
      order,
    });
  } else {
    res.status(404).send({ message: "Order Not Found" });
  }
});
export default orderRouter;
