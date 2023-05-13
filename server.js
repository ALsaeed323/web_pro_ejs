import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import seedRouter from "./routes/seedRoutes.js";
import mongoose from "mongoose";
import session from "express-session";
import bcryptjs from "bcryptjs";
import User from "./models/userModel.js";
import productRouter from "./routes/productRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
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

app.use("/api/seed", seedRouter);
app.use("/products", productRouter);
app.use("/cart", cartRouter);

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.create({
      name,
      email,
      password: bcryptjs.hashSync(password),
      isAdmin: false,
    });
    const createdUser = await user.save();
    req.session.user = createdUser;
    res.status(200).send({ message: "Logged in" });
  } catch (err) {
    res.status(409).send({ message: "Invalid email" });
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
app.post("/shipping", async (req, res) => {
  try {
    const { fullName, address, city, postalCode, country } = req.body;
    const newShippingAddress = { fullName, address, city, postalCode, country };
    const user = await User.findOneAndUpdate(
      { _id: req.session.user._id },
      {
        shippingAddress: newShippingAddress,
      },
      {
        new: true,
      }
    );
    req.session.user = user;
    res.status(200).send({ message: "Shipping address saved" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.get("/:route", async (req, res) => {
  if (!req.session.cart) req.session.cart = [];
  const title = {
    signin: "Sign In",
    signup: "Sign Up",
    about: "About Us",
    contact: "Contact Us",
    cart: "Cart",
    search: "Search",
   
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
  if (!req.session.cart) req.session.cart = [];
  const cats = await Product.find().distinct("category");
  res.render("pages/index", {
    cats,
    user: req.session.user,
    cart: req.session.cart,
  });
});

let PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://${hostname}:${PORT}`);
});
