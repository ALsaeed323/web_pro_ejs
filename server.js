import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";
import { products } from "./products.js";

//Read the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hostname = "127.0.0.1";
const port = 80;
const app = express();

app.set("view engine", "ejs");
//app.use(express.static('public'));
app.use("/public", express.static(__dirname + "/public"));
//app.set('views', path.join(__dirname, '../views'));

app.get("/product/:slug", function (req, res) {
  const product = products.find((p) => p.slug === req.params.slug);
  res.render("pages/route", {
    path: "product",
    title: product.name,
    payload: product,
  });
});

app.get("/:route", function (req, res) {
  const title = {
    signin: "Sign In",
    signup: "Sign Up",
    about: "About Us",
    products: "Products",
  };
  console.log(req.params.route);
  res.render("pages/route", {
    path: req.params.route,
    title: title[req.params.route],
    payload: products,
  });
});

// app.get("/signin", function (req, res) {
//   res.render("pages/signin");
// });
app.get("/", function (req, res) {
  // let data = {
  //   name: 'Yahia Khalid',
  //   age: 21,
  //   city: 'Cairo',
  //   favorite_food: 'Pizza'
  // };
  console.log("Rendering index page...");
  res.render("pages/index");
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

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}`);
  //console.log(`Server running at local dirname :  ${__dirname})  `);
});
