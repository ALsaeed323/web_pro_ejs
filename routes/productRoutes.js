import express from "express";
//import expressAsyncHandler from "express-async-handler";
import Product from "../models/productModel.js";

const productRouter = express.Router();

productRouter.get("/", async (req, res) => {
  const products = await Product.find();
  const cats = await Product.find().distinct("category");
  res.render("pages/route", {
    path: "products",
    title: "Product",
    products,
    cats,
    user: req.session.user,
    cart: req.session.cart,
  });
});
//product add new for mange card
productRouter.get('addcard', async (req, res) => {
  const cats = await Product.find().distinct("category");
  res.render("pages/route", {
    path: "products",
    title: "addcard",
    cats,
    user: req.session.user,
    cart: req.session.cart,
  });
});
productRouter.post('addcard', async (req, res) => {
  const newProduct = new Product({
    name: 'sample name ' + Date.now(),
    slug: 'sample-name-' + Date.now(),
    image: '/images/p1.jpg',
    price: 0,
    category: 'sample category',
    brand: 'sample brand',
    countInStock: 0,
    rating: 0,
    numReviews: 0,
    description: 'sample description',
  });
   const product = await newProduct.save();
   res.send({message: "product created and",product});
});

productRouter.put(
  '/:id',(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      product.name = req.body.name;
      product.slug = req.body.slug;
      product.price = req.body.price;
      product.image = req.body.image;
      product.category = req.body.category;
      product.brand = req.body.brand;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;
      await product.save();//need to update it's not gonna work like this
      res.send({ message: 'Product Updated' });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

productRouter.delete('/:id',(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.remove();
      res.send({ message: 'Product Deleted' });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);


const prices = [
  {
    name: "$1 to $50",
    value: "1-50",
  },
  {
    name: "$51 to $200",
    value: "51-200",
  },
  {
    name: "$201 to $1000",
    value: "201-1000",
  },
];

const PAGE_SIZE = 3;
productRouter.get("/search", async (req, res) => {
  const cats = await Product.find().distinct("category");
  let { page, order, price, category, query, pageSize } = req.query;
  pageSize = pageSize || PAGE_SIZE;
  const q = { page, order, price, category, query };
  page = page || 1;
  order = order || "";
  price = price || "";
  category = category || "";
  const searchQuery = query || "";

  const queryFilter =
    searchQuery && searchQuery !== "all"
      ? {
          name: {
            $regex: searchQuery,
            $options: "i",
          },
        }
      : {};
  const categoryFilter = category && category !== "all" ? { category } : {};
  const priceFilter =
    price && price !== "all"
      ? {
          // 1-50
          price: {
            $gte: Number(price.split("-")[0]),
            $lte: Number(price.split("-")[1]),
          },
        }
      : {};
  const sortOrder =
    order === "lowest"
      ? { price: 1 }
      : order === "highest"
      ? { price: -1 }
      : order === "newest"
      ? { createdAt: -1, _id: -1 }
      : { _id: -1 };
  const products = await Product.find({
    ...queryFilter,
    ...categoryFilter,
    ...priceFilter,
  })
    .sort(sortOrder)
    .skip(pageSize * (page - 1))
    .limit(pageSize);
  const countProducts = await Product.countDocuments({
    ...queryFilter,
    ...categoryFilter,
    ...priceFilter,
  });
  res.render("pages/route", {
    path: "search",
    title: "Search Products",
    cats,
    cart: req.session.cart,
    prices,
    user: req.session.user,
    q,
    products,
    countProducts,
    page,
    pages: Math.ceil(countProducts / pageSize),
  });
});

//always at the end
productRouter.get("/:id", async (req, res) => {
  const cats = await Product.find().distinct("category");
  try {
    const product = await Product.findById(req.params.id);
    res.render("pages/route", {
      path: "product",
      title: product.name,
      product,
      cats,
      cart: req.session.cart,
      user: req.session.user,
    });
  } catch {
    res.render("pages/route", {
      path: "404",
      title: "404 Not Found",
      cats,
      user: req.session.user,
      cart: req.session.cart || [],
    });
  }
});

export default productRouter;
