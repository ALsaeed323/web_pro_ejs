import express from "express";
//import expressAsyncHandler from "express-async-handler";
import Product from "../models/productModel.js";

const productRouter = express.Router();

productRouter.get("/", async (req, res) => {
  if (!req.session.cart) req.session.cart = [];
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
const PAGE_SIZE = 1;
productRouter.get("/search", async (req, res) => {
  if (!req.session.cart) req.session.cart = [];
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
  if (!req.session.cart) req.session.cart = [];
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
/* 
productRouter.get('/', async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

const PAGE_SIZE = 3;
productRouter.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || '';
    const price = query.price || '';
    const rating = query.rating || '';
    const order = query.order || '';
    const searchQuery = query.query || '';

    const queryFilter =
      searchQuery && searchQuery !== 'all'
        ? {
            name: {
              $regex: searchQuery,
              $options: 'i',
            },
          }
        : {};
    const categoryFilter = category && category !== 'all' ? { category } : {};
    const ratingFilter =
      rating && rating !== 'all'
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const priceFilter =
      price && price !== 'all'
        ? {
            // 1-50
            price: {
              $gte: Number(price.split('-')[0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {};
    const sortOrder =
      order === 'featured'
        ? { featured: -1 }
        : order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
        ? { rating: -1 }
        : order === 'newest'
        ? { createdAt: -1 }
        : { _id: -1 };

    const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  })
);

productRouter.get('/slug/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});
productRouter.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});
*/
export default productRouter;