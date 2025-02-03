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
        // The color can either be a specific color or null if there's no color option
        color: { type: String, default: null }, 
    
        // Size can either be a specific size or 'All' (if no size differentiation is needed)
        size: { 
          type: String, 
          enum: ["All", "S", "M", "L", "XL"], 
          default: "All"  
        },
    
        stockPerOne: { 
          type: Number, 
          required: true 
        },
      }
    ],    
    categoryId: { type: Types.ObjectId, ref: "Category", required: true },
    subcategoryId: { type: Types.ObjectId, ref: "Subcategory", required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User", required: true },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numberOfRatings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
// Adding a virtual to populate reviews when fetching product
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'productId',
  justOne: false, // Set to false to populate multiple reviews
});

const productModel = mongoose.models.Product || model("Product", productSchema);
export default productModel;
