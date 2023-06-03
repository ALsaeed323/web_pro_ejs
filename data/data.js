const data = {
  users: [
    {
      name: "Mohamed Elkmeshi",
      email: "elkmeshi2002@gmail.com",
      password: "MohElk13241?",
      isAdmin: true,
    },
    {
      name: "Naeem Allwati",
      email: "nallwati@redtech.ly",
      password: "1234",
      isAdmin: true,
    },
  ],
  reports:[
    {
      problems:" the cart doesn't want to add a new product"
      
    }
  ],
  products: [
    {
      name: "Nike Slim shirt",
      slug: "nike-slim-shirt",
      category: "Shirts",
      image: "/public/image/p1.jpg", // 679px × 829px
      price: 120,
      countInStock: 10,
      brand: "Nike",
      description: "high quality shirt",
    },
    {
      name: "Adidas Fit Shirt",
      slug: "adidas-fit-shirt",
      category: "Shirts",
      image: "/public/image/p2.jpg",
      price: 250,
      countInStock: 20,
      brand: "Adidas",
      description: "high quality product",
    },
    {
      name: "Nike Slim Pant",
      slug: "nike-slim-pant",
      category: "Pants",
      image: "/public/image/p3.jpg",
      price: 25,
      countInStock: 15,
      brand: "Nike",
      description: "high quality product",
    },
    {
      name: "Adidas Fit Pant",
      slug: "adidas-fit-pant",
      category: "Pants",
      image: "/public/image/p4.jpg",
      price: 65,
      countInStock: 5,
      brand: "Puma",
      description: "high quality product",
    },
  ],
};

export default data;
