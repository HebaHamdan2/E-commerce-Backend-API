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

  const count = await productModel.estimatedDocumentCount();
  return res.json({ message: 'success', page: products.length, total: count, products });
};

export const createProduct = async (req, res, next) => {
  let { name, price, discount, categoryId, subcategoryId, variants } = req.body;

  // Check if variants is passed as a string and parse it into an array
  if (typeof variants === "string") {
    try {
      variants = JSON.parse(variants); // Parse the stringified JSON into an actual array
    } catch (error) {
      return next(new Error("Invalid format for variants. Unable to parse JSON.", { cause: 400 }));
    }
  }
if (!Array.isArray(variants) || variants.length === 0) {
  return next(new Error('Variants must be an array and cannot be empty.', { cause: 400 }));
}

// Validate each variant to ensure stockPerOne is present
variants.forEach(variant => {
  if (variant.stockPerOne === undefined || variant.stockPerOne < 0) {
    return next(new Error("Each variant must have a valid stock quantity (stockPerOne).", { cause: 400 }));
  }
    // If a size or color is provided, ensure it's valid
    if (variant.size && !["All", "S", "M", "L", "XL"].includes(variant.size)) {
      return next(new Error("Size must be one of 'All', 'S', 'M', 'L', 'XL'.", { cause: 400 }));
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
    // Set default status and isDeleted flag
    req.body.status = req.body.status || "Active";
    req.body.isDeleted = req.body.isDeleted || false;
  

  // Set initial values for avgRating and numberOfRatings
  req.body.avgRating = 0;
  req.body.numberOfRatings = 0;
  req.body.variants = variants;
  req.body.stock = variants.reduce((total, variant) => total + variant.stockPerOne, 0);
  try {
    const product = await productModel.create(req.body);
    if (!product) {
      return next(new Error(`Error while creating product`, { cause: 400 }));
    }

    // Return the created product with a success message
    return res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    return next(new Error(`Error while creating product: ${error.message}`, { cause: 500 }));
  }
};

export const getProductWithCategory = async (req, res) => {
  const products = await productModel
    .find({ categoryId: req.params.categoryId })
    .populate('reviews');

  return res.status(200).json({ message: 'success', products });
};

export const getProduct = async (req, res) => {
  const product = await productModel
    .findById(req.params.productId)
    .populate('reviews');
  return res.status(200).json({ message: 'success', product });
};
