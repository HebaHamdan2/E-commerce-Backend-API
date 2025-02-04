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
        color: { type: String, default: null },
        size: { type: String, enum: ["All", "S", "M", "L", "XL"], default: "All" },
        stockPerOne: { type: Number, required: true },
      }
    ]
,    
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
    buyers: [{ type: Types.ObjectId, ref: "User" }], //  users who bought the product

  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
productSchema.pre('save', function(next) {
  this.number_sellers = this.buyers.length; // Count the number of unique buyers
  next();
});
// Adding a virtual to populate reviews when fetching product
productSchema.virtual("reviews", {
  localField: "_id",
  foreignField: "productId",
  ref: "Review",
  justOne:false
});


const productModel = mongoose.models.Product || model("Product", productSchema);
export default productModel;
