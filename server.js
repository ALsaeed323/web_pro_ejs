import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import seedRouter from "./routes/seedRoutes.js";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import session from "express-session";
import bcryptjs from "bcryptjs";
import User from "./models/userModel.js";
import productRouter from "./routes/productRoutes.js";
import Product from "./models/productModel.js";
import dotenv from "dotenv";
dotenv.config();

//Read the current directory name
const hostname = "127.0.0.1";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(
  session({ secret: "Your_Secret_Key", resave: false, saveUninitialized: true })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use("/public", express.static(__dirname + "/public"));

if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to DB");
    })
    .catch((err) => {
      console.log("Error connecting to DB:", err.message);
    });
} else {
  console.error(
    "process.env.MONGODB_URI not set. Please provide a valid database connection string."
  );
}

function addToCart(product, cart) {
  if (!cart) {
    cart = [];
  }
  const cartItem = cart.find((p) => p._id === product._id.toString());
  console.log(cartItem);
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
  console.log(cart);
}

app.post("/cart/add", async (req, res) => {
  const _id = req.body.id;
  const product = await Product.find({ _id });
  addToCart(product[0], req.session.cart);
  res.send({ message: "Product added to cart", cart: req.session.cart });
});

app.use("/api/seed", seedRouter);
app.use("/products", productRouter);

app.post("/signup", async (req, res) => {
  //need check if email already exists
  const { email, password } = req.body;
  try {
    const user = await User.create({
      email,
      password: bcryptjs.hashSync(password),
    });
    const createdUser = await user.save();
    req.session.user = createdUser;
    res.status(200).send({ message: "Logged in" });
  } catch (err) {
    res.status(401).send({ message: "Invalid email" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check for email and password in the request
  if (!email || !password) {
    return res.status(400).send({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    // Check if user exists and password is correct
    if (user && bcryptjs.compareSync(password, user.password)) {
      req.session.user = user;
      return res.status(200).send({ message: "Logged in" });
    } else {
      return res.status(401).send({ message: "Invalid email or password" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Internal server error" });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy();
  res.status(200).send({ message: "Logged out" });
});

app.delete("/cart/remove", (req, res) => {
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
app.put("/cart/update", (req, res) => {
  console.log(req.body);
  console.log("req.session.cart");
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
app.get("/:route", async (req, res) => {
  const title = {
    signin: "Sign In",
    signup: "Sign Up",
    about: "About Us",
    contact: "Contact Us",
    cart: "Cart",
  };

  const cats = await Product.find().distinct("category");
  res.render("pages/route", {
    path: req.params.route.toLowerCase(),
    title: title[req.params.route],
    cats,
    user: req.session.user,
    cart: req.session.cart,
  });
});

app.get("/", async (req, res) => {
  const cats = await Product.find().distinct("category");
  res.render("pages/index", {
    cats,
    user: req.session.user,
    cart: req.session.cart || [],
  });
});

let PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://${hostname}:${PORT}`);
});
