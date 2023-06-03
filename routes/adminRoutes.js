import express from "express";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import { isAdmin } from "../controllers/userControllers.js";
import mongoose from "mongoose";
import fs from "fs";
import { uploadImage } from "../controllers/uploadControllers.js";
const adminRouter = express.Router();
const PAGE_SIZE = 4;

//products
//All products page
adminRouter.get("/products", isAdmin, async (req, res) => {
  const { query } = req;
  const page = query.page || 1;
  const pageSize = PAGE_SIZE;
  const products = await Product.find()
    .skip(pageSize * (page - 1))
    .limit(pageSize);
  const countProducts = await Product.countDocuments();
  const cats = await Product.find().distinct("category"); //["Pants,Shitrs","Hoodie"]
  res.render("pages/route", {
    title: "Display all probucts",
    path: "/admin/products", //the path that user entered
    cats, //the categories
    user: req.session.user, //the user
    cart: req.session.cart, //the cart
    products,
    countProducts,
    page,
    pages: Math.ceil(countProducts / pageSize),
  });
});

//Edit product page
adminRouter.get("/products/:id", isAdmin, async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  const cats = await Product.find().distinct("category");
  try {
    res.render("pages/route", {
      product,
      title: "Update Product" + product.name,
      path: "updateproduct", //the path that user entered
      cats, //the categories
      user: req.session.user, //the user
      cart: req.session.cart,
    });
  } catch (error) { }
});
adminRouter.post("/products/:id", isAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      product.name = req.body.name || product.name;
      product.slug = req.body.slug || product.slug;
      product.price = req.body.price || product.price;
      product.image = req.body.image || product.image;
      product.category = req.body.category || product.category;
      product.brand = req.body.brand || product.brand;
      product.countInStock = req.body.countInStock || product.countInStock;
      product.description = req.body.description || product.description;
      await product.save();
      res.send({ message: "Product Updated" });
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  } catch (error) { }
});
adminRouter.delete('/product/:id/image', isAdmin, async (req, res) => {
  //delete photo from local storge
  const productId = req.params.id;
  const product = await Product.findByIdAndUpdate(productId, { $unset: { image: "" } }, { new: false, useFindAndModify: false });
  fs.unlinkSync("." + product.image);
  if (product) {
    res.send({ message: "Product Updated" });
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
});
adminRouter.put("/product/:id", isAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).send({ message: "ID is inncroent" });
  const product = await Product.findById(req.params.id);
  if (product) {
    product.name = req.body.name || product.name;
    product.slug = req.body.slug || product.slug;
    product.price = req.body.price || product.price;
    product.category = req.body.category || product.category;
    product.brand = req.body.brand || product.brand;
    product.image = product.image || "";
    product.countInStock = req.body.countInStock || product.countInStock;
    product.description = req.body.description || product.description;
    await product.save();
    res.status(200).send("OK");
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
});
adminRouter.delete("/product/:id", isAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).send({ message: "ID is inncroent" });
  const product = await Product.findById(req.params.id);
  if (product) {
    await product.deleteOne();
    res.status(200).send({ message: "deleted" });
  } else {
    res.status(500).send({ message: "Product not Deleted" });
  }
});
adminRouter.post("/product/:id", isAdmin,uploadImage, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).send({ message: "ID is inncroent" });
  await Product.findByIdAndUpdate(
    req.params.id,
    { image: req.body.image },
    { new: true, useFindAndModify: false });
  res.status(200).send({ message: "Image uploaded" });
});
//add product page
adminRouter.get("/addproduct", isAdmin, async (req, res) => {
  const cats = await Product.find().distinct("category");
  res.render("pages/route", {
    title: "Add Product",
    path: "/admin/addproduct", //the path that user entered
    cats, //the categories
    user: req.session.user, //the user
    cart: req.session.cart, //the cart
  });
});
//add product API
adminRouter.post("/product", isAdmin, uploadImage, async (req, res) => {
  try {
    console.log(req.body);
    const product = new Product({
      name: req.body.name,
      slug: req.body.slug,
      price: req.body.price,
      image: req.body.image,
      category: req.body.category,
      brand: req.body.brand,
      countInStock: req.body.countInStock,
      description: req.body.description,
    });
    await product.save();
    res.redirect("/admin/products");
  } catch (error) {
    res.status(500).send({ message: "Product Not Created" });
  }
});


adminRouter.get("/users", isAdmin, async (req, res) => {
  const { query } = req;
  const page = query.page || 1;
  const pageSize = query.pageSize || PAGE_SIZE;

  const users = await User.find()
    .skip(pageSize * (page - 1))
    .limit(pageSize);
  const countUsers = await User.countDocuments();
  const cats = await Product.find().distinct("category");
  res.render("pages/route", {
    users,
    title: "List of user",
    path: "/admin/users", //the path that user entered
    cats, //the categories
    user: req.session.user, //the user
    cart: req.session.cart,
    page,
    pages: Math.ceil(countUsers / pageSize),
  });
});
adminRouter.get("/user/addnewuser", isAdmin, async (req, res) => {
  const cats = await Product.find().distinct("category");
  res.render("pages/route", {
    title: "Add New User",
    path: "addnewuser", //the path that user entered
    cats, //the categories
    user: req.session.user, //the user
    cart: req.session.cart,
  });
});
adminRouter.get("/user/:id", isAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).send({ message: "ID is inncroent" });
    const currentUser = await User.findById(req.params.id);
    const cats = await Product.find().distinct("category");
    if (currentUser) {
      res.render("pages/route", {
        currentUser,
        path: "/admin/user/edit",
        title: "Edit User", //the path that user entered
        cats, //the categories
        user: req.session.user, //the user
        cart: req.session.cart,
      });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  } catch (error) {
    // Handle the error
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});
adminRouter.post("/user/:id", isAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);
    user.save();
    res.redirect("/admin/users");
  } else {
    res.status(404).send({ message: "User Not Found" });
  }
});
adminRouter.delete("/user/:id", isAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).send({ message: "ID is inncroent" });
  const user = await User.findById(req.params.id);
  if (user) {
    await user.deleteOne();
    res.status(200).send({ message: "deleted" });
  } else {
    res.status(500).send({ message: "Product not Deleted" });
  }
});

//orders
adminRouter.get("/orders", isAdmin, async (req, res) => {

  const { query } = req;
  const page = query.page || 1;
  const pageSize = query.pageSize || PAGE_SIZE;
  const orders = await Order.find({}).populate("user", "name").skip(pageSize * (page - 1))
    .limit(pageSize);;
  const countOrders = await Order.countDocuments();
  const cats = await Product.find().distinct("category");
  res.render("pages/route", {
    orders,
    cats,
    title: "List of Orders",
    path: "/admin/orders", //the path that user entered
    user: req.session.user, //the user
    cart: req.session.cart,
    page,
    pages: Math.ceil(countOrders / pageSize),
  });
});
adminRouter.delete("/order/:id", isAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).send({ message: "ID is inncroent" });
  const order = await Order.findById(req.params.id);
  if (order) {
    await order.deleteOne();
    res.status(200).send({ message: "Order deleted" });
  } else {
    res.status(500).send({ message: "Order not Deleted" });
  }
});
adminRouter.post("/order/:id/pay", isAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).send({ message: "ID is inncroent" });
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
  }
  await order.save();
  res.redirect("/orders/" + req.params.id);
  // res.send({ message: "Order Paid", order: updatedOrder });
});
adminRouter.post("/order/:id/deliver", isAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).send({ message: "ID is inncroent" });
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }
  await order.save();
  res.redirect("/orders/" + req.params.id);
});

//idk
adminRouter.post('/log', isAdmin, async (req, res) => {
  const newProduct = new Product({
    name: req.body.product_name,
    slug: req.body.product_slug,
    image: req.body.product_image,
    price: req.body.product_price,
    category: req.body.product_category,
    brand: req.body.product_brand,
    countInStock: req.body.product_count,
    description: req.body.product_description,
  });
  const product = await newProduct.save();
  res.send({ message: 'Product Created', product });
});
adminRouter.get('/dash', isAdmin,
  async (req, res) => {

    const cats = await Product.find().distinct("category");
    res.render("pages/route", {
      title: "Dashboard",
      path: "dashboard", //the path that user entered
      cats, //the categories
      user: req.session.user, //the user
      cart: req.session.cart,
    });
});
adminRouter.get("/d", async (req, res) => {
  const cats = await Product.find().distinct("category");
  const countUsers = await User.countDocuments();
  const countOrders = await Order.countDocuments();
  const totalSale = await Product.find().distinct("price");
  let sumOfSales = 0;
  totalSale.forEach((ss) => {
    sumOfSales = sumOfSales + ss;
    ;
  });

  res.render("pages/route", {
    title: "dashboard",
    path: "dashboard", //the path that user entered
    countUsers,
    countOrders,
    sumOfSales,
    cats, //the categories
    user: req.session.user, //the user
    cart: req.session.cart,

  });
});
adminRouter.post("/reports", isAdmin, (req, res) => {
  const data = req.body;
  // Process the data and generate the report as needed
  console.log(data);
  res.send('Report generated successfully!');
});

export default adminRouter;
