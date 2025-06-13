import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    companyEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    officeEmail: {
      type: String,
      trim: true,
    },
    cinPanGst: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    agreeToTerms: {
      type: Boolean,
      default: false,
    },
    isRecruiter: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    // Updated fields for course assignments with student_id
    assignedCourses: [
      {
        university: {
          type: String,
          required: true,
          trim: true,
        },
        course: {
          type: String,
          required: true,
          trim: true,
        },
        specialization: {
          type: String,
          required: true,
          trim: true,
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
        // Store the student ID from external API
        studentId: {
          type: String,
          required: true, // Make it required
          trim: true,
        },
        // Store the status from external API response
        externalApiStatus: {
          type: Boolean,
          required: true, // Make it required
          default: false,
        },
        // Store the exists value from external API response - make it optional
        externalApiExists: {
          type: Number,
          default: null,
        },
        // Store the message from external API response
        externalApiMessage: {
          type: String,
          required: true, // Make it required
          trim: true,
        },
      },
    ],
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("validate", function (next) {
  if (this.isRecruiter) {
    if (!this.officeEmail) {
      this.invalidate("officeEmail", "officeEmail is required for Recruiter");
    }
  } else {
    if (!this.email) {
      this.invalidate("email", "email is required for candidate");
    }
  }
  next();
});

export default mongoose.models.User || mongoose.model("User", userSchema);
