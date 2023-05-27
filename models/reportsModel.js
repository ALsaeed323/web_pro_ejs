import mongoose from "mongoose";
const mongoose = require('mongoose');
const reportSchema = require(
    "reports",
    new mongoose.Schema(
        {
            report: { type: String, required: true, unique: false },
        }
    )
);