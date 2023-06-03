import express from "express";
import { isAdmin } from "../controllers/userControllers.js";
import path from "path";
import Product from "../models/productModel.js";
import mongoose from "mongoose";

const uploadRouter = express.Router();

uploadRouter.post("/:id",isAdmin, async (req, res) => {
  if(!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).send({ message: "ID is inncroent" });
  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  }
  let file = req.files.image;
  let filename = Date.now() + path.extname(file.name);
  let uploadPath = "./public/image/" + filename;
  file.mv(uploadPath, async function  (err) {
    if (err) return res.status(500).send(err);
    await Product.findByIdAndUpdate(
      req.params.id,
      { image: uploadPath.substring(1) },
      { new: true, useFindAndModify: false });
      res.status(200).send({ message: "Image uploaded" });
  });
});
export default uploadRouter;
