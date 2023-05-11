import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { products } from "./products.js";
import seedRouter from "./routes/seedRoutes.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

//Read the current directory name
const hostname = "127.0.0.1";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
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

app.get("/products/:slug", function (req, res) {
  const product = products.find((p) => p.slug === req.params.slug);
  res.render("pages/route", {
    path: "product",
    title: product.name,
    product,
    //TO DO GET CATEGORIES FROM DB
    cats: ["Shirts", "Pants"],
  });
});
app.get("/products", function (req, res) {
  res.render("pages/route", {
    path: req.params.route.toLowerCase(),
    title: title[req.params.route],
    products,
    //TO DO GET CATEGORIES FROM DB
    cats: ["Shirts", "Pants"],
  });
});

app.get("/:route", function (req, res) {
  const title = {
    signin: "Sign In",
    signup: "Sign Up",
    about: "About Us",
  };
  res.render("pages/route", {
    path: req.params.route.toLowerCase(),
    title: title[req.params.route],
    //TO DO GET CATEGORIES FROM DB
    /*cats = sections*/ cats: ["Shirts", "Pants"],
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
