import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import seedRouter from "./routes/seedRoutes.js";
import mongoose from "mongoose";
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
app.use(session({ secret: "Your_Secret_Key" }));
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

function addToCart(product) {
  const existingProductIndex = cart.findIndex((item) => item.id === product.id);
  if (existingProductIndex !== -1) {
    cart[existingProductIndex].quantity += 1;
  } else {
    const productWithQuantity = { ...product, quantity: 1 };
    cart.push(productWithQuantity);
  }
}
app.post("/cart/add", function (req, res) {
  const product = products.find((p) => p.slug === req.body.id);
  addToCart(product);
  res.send(cart);
});

app.use("/api/seed", seedRouter);
app.use("/products", productRouter);

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.create({
    email,
    password: bcryptjs.hashSync(password),
  });
  res.send(user);
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    if (bcryptjs.compareSync(req.body.password, user.password)) {
      req.session.user = user;
      console.log(req.session.user);
      res.status(200).send({ message: "Logged in" });
      return;
    }
  }
  res.status(401).send({ message: "Invalid email or password" });
});

app.get("/logout", (req, res) => {
  res.sendFile("C:\\Users\\melkmeshi\\Desktop\\backend\\login.html");
});

app.get("/:route", async (req, res) => {
  const title = {
    signin: "Sign In",
    signup: "Sign Up",
    about: "About Us",
  };
  const cats = await Product.find().distinct("category");
  res.render("pages/route", {
    path: req.params.route.toLowerCase(),
    title: title[req.params.route],
    /*cats = sections*/ cats,
  });
});

app.get("/", function (req, res) {
  res.render("pages/index", {
    //TO DO GET CATEGORIES FROM DB
    cats: ["Shirts", "Pants"],
  });
});

let PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://${hostname}:${PORT}`);
});
