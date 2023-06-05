import mongoose from "mongoose";

const Report = mongoose.model(
    "reports",
    new mongoose.Schema(
        {
            report: { type: String, required: true, unique: false },
        },
        {
            timestamps: true,
        }
    )
);
export default Report;