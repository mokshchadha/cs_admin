// src/lib/models/Company.ts
import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema(
  {
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    stipend: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    internships: [internshipSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Company ||
  mongoose.model("Company", companySchema);
