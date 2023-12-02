import slugify from "slugify";
import categoryModel from "../../../DB/model/category.model.js";
import subcategoryModel from "../../../DB/model/subCategory.model.js";
import cloudinary from "../../services/cloudinary.js";
import productModel from "../../../DB/model/product.model.js";

export const getProducts = async (req, res) => {
  const products = await productModel.find({});
  return res.json({ message: "products", products });
};

export const createProduct = async (req, res) => {
  const { name, price, discount, categoryId, subcategoryId } = req.body;
  const checkCategory = await categoryModel.findById(categoryId);
  if (!checkCategory) {
    return res.status(404).json({ message: "category not found" });
  }
  const checksubCategory = await subcategoryModel.findById(subcategoryId);
  if (!checksubCategory) {
    return res.status(404).json({ message: "sub category not found" });
  }
  req.body.slug = slugify(name);
  req.body.finalPrice = price - ((price * (discount || 0)) / 100).toFixed(2);
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
  if (!product) {
    return res.status(400).json({ message: "error while creating product" });
  }
  return res.status(201).json({ message: "success", product });
};

export const getProductWithCategory = async (req, res) => {
  const products = await productModel.find({
    categoryId: req.params.categoryId,
  });
  return res.status(200).json({ message: "success", products });
};
export const getProduct = async (req, res) => {
  const product = await productModel.findById(req.params.productId);
  return res.status(200).json({ message: "success", product });
};
