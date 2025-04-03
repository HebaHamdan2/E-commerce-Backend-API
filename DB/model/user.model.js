import mongoose, { Schema, model } from "mongoose";
const userShema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      min: 4,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive"],
    },
    profilePic: {
      type: Object,
      default: null,
    },
    role: {
      type: String,
      default: "User",
      enum: ["User", "Admin"],
    },
    sendCode: {
      type: String,
      default: null,
    },
    changePasswordTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.models.User || model("User", userShema);
export default userModel;
