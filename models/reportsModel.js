const mongoose = require('mongoose');
const reportSchema = require(
    "reports",
    new mongoose.Schema(
        {
            report: { type: String, required: true, unique: false },
        }
    )
);
// const report=require(
//     "reports",
//     new mongoose.Schema(
//         {
//             report:{ type: string, required : true,unique :false },
//         },
//         {

//         }
//     )
