import express from "express";
import User from "../models/userModel.js";
import Report from "../models/reportsModel.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import Product from "../models/productModel.js";

const userRouter = express.Router();

userRouter.post("/signin", async (req, res) => {
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
    if (user && await bcryptjs.compare(password, user.password)) {
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
userRouter.post("/forgetpass", async (req, res) => {
  const email = req.body.email;
  try{
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send({ message: "Invalid email" });
    }
    const token = jwt.sign(
      {
        email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    const data = {
      email,
      title:"Reset Password",
      message:`Please click on the link to reset your password https://eshtrely.live/user/forgetpass/${token} \n Link is only vaild for 24 Hours`,
    }
    await fetch("https://prod-23.westeurope.logic.azure.com:443/workflows/ff7fb991b3024216922cc62eed94c2c7/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=aB5NNjoeSVItjkDIDA3gorsZJ1fUtRGOM7sHoiWCdbQ", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    res.send({ message: "Email sent" });
  }
  catch(err){ 
    res.status(500).send({ message: "Internal server error" });
  }
});
userRouter.get("/forgetpass/:token", async (req, res) => {
  const token = req.params.token;
  jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
    if (err) {
      res.status(401).send({ message: "Invalid Token" });
    } else {
      try{
        const cats = await Product.find().distinct("category"); //["Pants,Shitrs","Hoodie"]
        res.render("./pages/route", { 
          email:decode.email,
          path: "/user/resetpass", //the path that user entered
          title: "Rest Password", //the title of the page
          cats, //the categories 
          user: req.session.user, //the user
          cart: req.session.cart, //the cart
         });
      }
      catch(err){
        console.error(err);
        return res.status(500).send({ message: "Internal server error" });
      }
    }
  });
});
userRouter.post("/forgetpass/:token", async (req, res) => {
  const password = req.body.password;
  const token = req.params.token;
  jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
      if (err) {
        res.status(401).send({ message: "Invalid Token" });
      } else {
        try{
          const user = await User.findOne({ email:decode.email });
          user.password = password;
          await user.save();     
          res.send({ message: "Password changed" })     
        }
        catch(err){
          console.error(err);
          return res.status(500).send({ message: "Internal server error" });
        }
      }
    });
});
userRouter.post("/logout", (req, res) => {
  // Destroy the session
  req.session.destroy();
  res.status(200).send({ message: "Logged out" });
});
userRouter.post("/shipping", async (req, res) => {
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
userRouter.post("/payment", async (req, res) => {
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
userRouter.post("/profile", async (req, res) => {
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
userRouter.post("/signup", async (req, res) => {
    // Get name, email and password from the request
    const { name, email, password } = req.body;
    try {
      // Create a new user
      const user = await User.create({
        name,
        email,
        password: password,
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
// userRouter.post("/email", async (req, res) => {
  
// });
userRouter.post("/reports", async (req, res) => {
  try {
    console.log(req.body);
    for (let i = 0; i < req.body.reports.length; i++) {
      const report = new Report({
        report: req.body.reports[i],
      });
      await report.save();
    }
    res.redirect("/index");
  } catch (error) {
    res.status(500).send({ message: "Report(s) not created" });
  }
});

export default userRouter;
