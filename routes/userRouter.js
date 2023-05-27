import express from "express";
import { body, validationResult } from "express-validator";
import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";

const userRouter = express.Router();

const validateSignup = [
  body("username").notEmpty().withMessage("Username is required"),
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("password")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
    ),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];

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
export default userRouter;
