import slugify from "slugify";
import categoryModel from "../../../DB/model/category.model.js";
import subcategoryModel from "../../../DB/model/subCategory.model.js";
import cloudinary from "../../services/cloudinary.js";
import productModel from "../../../DB/model/product.model.js";
import { pagination } from "../../services/pagination.js";

export const getProducts = async (req, res) => {
  const { skip, limit } = pagination(req.query.page, req.query.limit);

  let queryObj = { ...req.body };
  const execQuery = ["page", "limit", "skip", "sort", "search"];
  execQuery.forEach((ele) => delete queryObj[ele]);

  queryObj = JSON.stringify(queryObj);
  queryObj = queryObj.replace(/\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g, (match) => `$${match}`);
  queryObj = JSON.parse(queryObj);

  let mongooseQuery = productModel.find(queryObj).limit(limit).skip(skip);

  if (req.query.search) {
    mongooseQuery = mongooseQuery.find({
      $or: [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ],
    });
  }

  mongooseQuery = mongooseQuery
    .populate({ path: "reviews", model: "Review", populate: { path: "createdBy", model: "User", select: "userName profilePic" } })

  const products = await mongooseQuery.sort(req.query.sort?.replaceAll(",", " "));

  const count = await productModel.countDocuments();

  return res.json({ message: "success", page: products.length, total: count, products });
};



export const createProduct = async (req, res, next) => {
  const { name, price, discount, categoryId, subcategoryId } = req.body;

  const checkCategory = await categoryModel.findById(categoryId);
  if (!checkCategory) return next(new Error("Category not found", { cause: 404 }));

  const checkSubCategory = await subcategoryModel.findById(subcategoryId);
  if (!checkSubCategory) return next(new Error("Subcategory not found", { cause: 404 }));

  req.body.slug = slugify(name);
  req.body.finalPrice = price - (price * (discount || 0)) / 100;

 const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.files.mainImage[0].path,
    { folder: `${process.env.APP_NAME}/product/${req.body.name}/mainImage` }
  );
  req.body.mainImage = { public_id, secure_url };

  req.body.subImages = [];
  for (const file of req.files.subImages) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      file.path,
      { folder: `${process.env.APP_NAME}/product/${req.body.name}/subImages` }
    );
    req.body.subImages.push({ public_id, secure_url });
  }

  req.body.createdBy = req.user._id;
  req.body.updatedBy = req.user._id;

  const product = await productModel.create(req.body);
  if (!product) return next(new Error("Error while creating product", { cause: 400 }));

  return res.status(201).json({ message: "success", product });
};

export const getProductWithCategory = async (req, res) => {
  const products = await productModel.find({ categoryId: req.params.categoryId });
  return res.status(200).json({ message: "success", products });
};

export const getProduct = async (req, res) => {
  const product = await productModel.findById(req.params.productId)
  .populate({ path: "reviews", model: "Review", populate: { path: "createdBy", model: "User", select: "userName profilePic" } })

  return res.status(200).json({ message: "success", product });
};
