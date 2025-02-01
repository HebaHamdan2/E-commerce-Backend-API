import slugify from "slugify";
import categoryModel from "../../../DB/model/category.model.js";
import subcategoryModel from "../../../DB/model/subCategory.model.js";
import cloudinary from "../../services/cloudinary.js";
import productModel from "../../../DB/model/product.model.js";
import { pagination } from "../../services/pagination.js";
export const getProducts = async (req, res) => {
  const { skip, limit } = pagination(req.query.page, req.query.limit);

  let queryObj = { ...req.body };
  const execQuery = ['page', 'limit', 'skip', 'sort', 'search'];
  execQuery.forEach((ele) => {
    delete queryObj[ele];
  });

  queryObj = JSON.stringify(queryObj);
  queryObj = queryObj.replace(/\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g, (match) => `$${match}`);
  queryObj = JSON.parse(queryObj);

  // Build the base query
  let mongooseQuery = productModel.find(queryObj).limit(limit).skip(skip);

  // Search functionality
  if (req.query.search) {
    mongooseQuery = mongooseQuery.find({
      $or: [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ],
    });
    mongooseQuery.select('name mainImage');
  }

  // Populate reviews and calculate the average rating & number of reviews
  mongooseQuery = mongooseQuery.populate('reviews');

  const products = await mongooseQuery.sort(req.query.sort?.replaceAll(',', ' '));

  // Calculate avgRating and numberOfRatings for each product
  for (const product of products) {
    let totalRatings = 0;
    let ratingCount = product.reviews.length;

    if (ratingCount > 0) {
      totalRatings = product.reviews.reduce((acc, review) => acc + review.rating, 0);
      product.avgRating = totalRatings / ratingCount;
      product.numberOfRatings = ratingCount;
    } else {
      product.avgRating = 0;
      product.numberOfRatings = 0;
    }
  }

  const count = await productModel.estimatedDocumentCount();
  return res.json({ message: 'success', page: products.length, total: count, products });
};

export const createProduct = async (req, res, next) => {
  const { name, price, discount, categoryId, subcategoryId, variants } = req.body;
  if (!Array.isArray(variants) || variants.length === 0) {
    return next(new Error('Variants must be an array and cannot be empty.'));
  }

  // Validation for variants
  if (!variants || variants.length === 0) {
    return next(new Error("Product must have at least one variant (color/size).", { cause: 400 }));
  }

  variants.forEach(variant => {
    if (!variant.color || !variant.size || !variant.stock) {
      return next(new Error("Each variant must have color, size, and stock.", { cause: 400 }));
    }
  });

  const checkCategory = await categoryModel.findById(categoryId);
  if (!checkCategory) {
    return next(new Error(`Category not found`, { cause: 404 }));
  }

  const checkSubCategory = await subcategoryModel.findById(subcategoryId);
  if (!checkSubCategory) {
    return next(new Error(`Subcategory not found`, { cause: 404 }));
  }

  req.body.slug = slugify(name);
  req.body.finalPrice = (price - ((price * (discount || 0)) / 100)).toFixed(2);

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

  // Set initial values for avgRating and numberOfRatings
  req.body.avgRating = 0;
  req.body.numberOfRatings = 0;
  req.body.variants = variants; // Adding variants here

  const product = await productModel.create(req.body);
  if (!product) {
    return next(new Error(`Error while creating product`, { cause: 400 }));
  }

  return res.status(201).json({ message: 'success', product });
};

export const getProductWithCategory = async (req, res) => {
  const products = await productModel
    .find({ categoryId: req.params.categoryId })
    .populate('reviews');

  // Calculate avgRating and numberOfRatings for each product
  for (const product of products) {
    let totalRatings = 0;
    let ratingCount = product.reviews.length;

    if (ratingCount > 0) {
      totalRatings = product.reviews.reduce((acc, review) => acc + review.rating, 0);
      product.avgRating = totalRatings / ratingCount;
      product.numberOfRatings = ratingCount;
    } else {
      product.avgRating = 0;
      product.numberOfRatings = 0;
    }
  }

  return res.status(200).json({ message: 'success', products });
};

export const getProduct = async (req, res) => {
  const product = await productModel
    .findById(req.params.productId)
    .populate('reviews');

  // Calculate avgRating and numberOfRatings for this product
  let totalRatings = 0;
  let ratingCount = product.reviews.length;

  if (ratingCount > 0) {
    totalRatings = product.reviews.reduce((acc, review) => acc + review.rating, 0);
    product.avgRating = totalRatings / ratingCount;
    product.numberOfRatings = ratingCount;
  } else {
    product.avgRating = 0;
    product.numberOfRatings = 0;
  }

  return res.status(200).json({ message: 'success', product });
};
