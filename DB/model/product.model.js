import mongoose, { Schema, model, Types } from "mongoose";
const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    finalPrice: { type: Number },
    number_sellers: {
      type: Number,
      default: 0,
    },
    mainImage: {
      type: Object,
      required: true,
    },
    subImages: [{ type: Object, required: true }],
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive"],
    },
    isDeleted: { type: Boolean, default: false },
    variants: [
      {
        color: { type: String, required: true },
        size: { type: String, enum: ["S", "M", "L", "XL"], required: true },
        stock: { type: Number, required: true }, // stock for the color/size combination
      }],
    categoryId: { type: Types.ObjectId, ref: "Category", required: true },
    subcategoryId: { type: Types.ObjectId, ref: "Subcategory", required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User", required: true },
    avgRating: { // average rating for the product
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numberOfRatings: { // number of ratings for the product
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const productModel = mongoose.models.Product || model("Product", productSchema);
export default productModel;
