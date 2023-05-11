import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { products } from "./products.js";

//Read the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import dotenv from 'dotenv';
dotenv.config();


const hostname = "127.0.0.1";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let cart = [];

app.set("view engine", "ejs");
app.use("/public", express.static(__dirname + "/public"));

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

app.get("/product/:slug", function (req, res) {
  const product = products.find((p) => p.slug === req.params.slug);
  res.render("pages/route", {
    path: "product",
    title: product.name,
    payload: product,
    //TO DO GET CATEGORIES FROM DB
    cats: ["Shirts", "Pants"],
  });
});

app.get("/:route", function (req, res) {
  const title = {
    signin: "Sign In",
    signup: "Sign Up",
    about: "About Us",
    products: "Products",
  };
  res.render("pages/route", {
    path: req.params.route.toLowerCase(),
    title: title[req.params.route],
    payload: products,
    //TO DO GET CATEGORIES FROM DB
    cats: ["Shirts", "Pants"],
  });
});

app.get("/", function (req, res) {
  // let data = {
  //   name: 'Yahia Khalid',
  //   age: 21,
  //   city: 'Cairo',
  //   favorite_food: 'Pizza'
  // };
  console.log("Rendering index page...");
  res.render("pages/index", {
    //TO DO GET CATEGORIES FROM DB
    cats: ["Shirts", "Pants"],
  });
});

app.get("/laaptop", function (req, res) {
  res.render("/pages/laaptop");
});

app.get("/phhones", function (req, res) {
  // let browsers = [
  //   { name: 'chrome', org: "Google", share: "62%"},
  //   { name: 'Safari', org: "Apple", share: "24%"},
  //   { name: 'Edge', org: "Microsoft", share: "5%"}
  // ];
  res.render("/pages/phhones");

  let tagline = "Browsers and their market share";
  res.render("pages/loop", { browsers: browsers, tagline: tagline });
});
app.use((req,res)=> {
  res.status(404).render('404');
})

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://${hostname}:${process.env.PORT}`)
})