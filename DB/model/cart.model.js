import mongoose, { Schema, model, Types } from "mongoose";
const cartSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: [
      {
        productId: { type: Types.ObjectId, ref: "Product", required: true },
        color: { type: String, default: null },
        size: { type: String, enum: ["All", "S", "M", "L", "XL"], default: "All" },
        quantity: { type: Number, default: 1 },
      },
    ],
    count:{
      type:Number,default:1
    }
  },
  {
    timestamps: true,
  }
);

const cartModel = mongoose.models.Cart || model("Cart", cartSchema);
export default cartModel;
