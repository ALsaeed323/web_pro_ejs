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
import orderRouter from "./routes/orderRoutes.js";
import Product from "./models/productModel.js";
import dotenv from "dotenv";
dotenv.config();

//Read the current directory name
const hostname = "127.0.0.1";
const PORT = process.env.PORT || 3000;
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

//connection database
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
app.use("/orders", orderRouter);

app.post("/signup", async (req, res) => {
  // Get name, email and password from the request
  const { name, email, password } = req.body;
  try {
    // Create a new user
    const user = await User.create({
      name,
      email,
      password: bcryptjs.hashSync(password),
      isAdmin: false,
    });
    // Save the user in the database
    const createdUser = await user.save();
    // Save the user in the session
    req.session.user = createdUser;
    res.status(200).send({ message: "Logged in" });
  } catch (err) {
    res.status(409).send({ message: "Invalid email" });
  }
});
app.post("/login", async (req, res) => {
  // Get email and password from the request
  const { email, password } = req.body;
  // Check for email and password in the request
  if (!email || !password) {
    return res.status(400).send({ message: "Email and password are required" });
  }
  try {
    // Find the user in the database
    const user = await User.findOne({ email });
    // Check if user exists and password is correct
    if (user && bcryptjs.compareSync(password, user.password)) {
      // Save the user in the session
      req.session.user = user;
      return res.status(200).send({ message: "Logged in" });
    } else {
      // Send error message if user doesn't exist or password is incorrect
      return res.status(401).send({ message: "Invalid email or password" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Internal server error" });
  }
});
app.post("/logout", (req, res) => {
  // Destroy the session
  req.session.destroy();
  res.status(200).send({ message: "Logged out" });
});
app.post("/shipping", async (req, res) => {
  try {
    // Get the shipping address from the request
    const { fullName, address, city, postalCode, country } = req.body;
    // Create a new shipping address Object
    const newShippingAddress = { fullName, address, city, postalCode, country };
    // Find the user in the database and update the shipping address
    const user = await User.findOneAndUpdate(
      { _id: req.session.user._id },
      {
        shippingAddress: newShippingAddress,
      },
      {
        new: true,
      }
    );
    // Save the user with new data in the session
    req.session.user = user;
    res.status(200).send({ message: "Shipping address saved" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Internal server error" });
  }
});
app.post("/payment", async (req, res) => {
  try {
    // Get the shipping address from the request
    const { paymentMethod } = req.body;
    // Find the user in the database and update the Payment Method
    const user = await User.findOneAndUpdate(
      { _id: req.session.user._id },
      {
        paymentMethod,
      },
      {
        new: true,
      }
    );
    // Save the user with new data in the session
    req.session.user = user;
    res.status(200).send({ message: "Shipping address saved" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.post("/profile", async (req, res) => {
  const user = await User.findById(req.session.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = bcryptjs.hashSync(req.body.password);
    }
    const updatedUser = await user.save();
    req.session.user = updatedUser;
    res.status(200).send({ message: "User Updated" });
  } else {
    res.status(404).send({ message: "User Not Found" });
  }
});

app.get("/", async (req, res) => {
  //if there is no cart, create one
  const cats = await Product.find().distinct("category");
  //render the index page
  res.render("pages/index", {
    cats, //the categories
    user: req.session.user, //the user
    cart: req.session.cart, //the cart
  });
});

//anything under this route won't be seen
app.get("/:route", async (req, res) => {
  const title = {
    signin: "Sign In",
    signup: "Sign Up",
    about: "About Us",
    contact: "Contact Us",
    cart: "Cart",
    search: "Search",
  };
  const cats = await Product.find().distinct("category"); //["Pants,Shitrs","Hoodie"]
  res.render("pages/route", {
    path: req.params.route.toLowerCase(), //the path that user entered
    title: title[req.params.route], //the title of the page
    cats, //the categories
    user: req.session.user, //the user
    cart: req.session.cart, //the cart
  });
});
app.listen(PORT, () => {
  console.log(`Server running at http://${hostname}:${PORT}`);
});
