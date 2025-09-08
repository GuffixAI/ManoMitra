// FILE: server/models/aiReport.model.js
import mongoose from "mongoose";

const DemoReportSchema = new mongoose.Schema({
    demo_content: {type: String}
});

const StandardReportSchema = new mongoose.Schema({
    standard_content: { type: String },
});

const AIReportSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
        index: true,
    },
    demo_report: DemoReportSchema,
    standard_report: StandardReportSchema,
}, { timestamps: true });

export default mongoose.model("AIReport", AIReportSchema);