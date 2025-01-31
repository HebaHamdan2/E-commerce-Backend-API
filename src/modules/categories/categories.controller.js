import slugify from "slugify";
import categoryModel from "../../../DB/model/category.model.js";
import cloudinary from "../../services/cloudinary.js";
import { pagination } from "../../services/pagination.js";
import productModel from "../../../DB/model/product.model.js";
import subcategoryModel from "../../../DB/model/subCategory.model.js";
export const getCategories = async (req, res) => {
  const { skip, limit } = pagination(req.query.page, req.query.limit);
  const categories = await categoryModel
    .find()
    .skip(skip)
    .limit(limit)
    .populate("subcategory");
  return res.status(200).json({ message: "success", categories });
};
export const getActiveCategory = async (req, res) => {
  const { skip, limit } = pagination(req.query.page, req.query.limit);
  const categories = await categoryModel
    .find({ status: "Active" })
    .skip(skip)
    .limit(limit)
    .select("name image");
  return res
    .status(200)
    .json({ message: "success", count: categories.length, categories });
};
export const SpecificCategory = async (req, res, next) => {
  const { id } = req.params;
  const category = await categoryModel.findById(id);
  if (!category) {
    return next(new Error(`category not found`, { cause: 404 }));
  }
  return res.json({ message: "success", category });
};

export const createCategory = async (req, res, next) => {
  const name = req.body.name.toLowerCase();
  if (await categoryModel.findOne({ name })) {
    return next(new Error(`category name already exists`, { cause: 409 }));
  }
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.APP_NAME}/categories`,
    }
  );
  const category = await categoryModel.create({
    name,
    slug: slugify(name),
    image: { secure_url, public_id },
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });
  return res.status(201).json({ message: "success", category });
};

export const updateCategory = async (req, res, next) => {
  const category = await categoryModel.findById(req.params.id);
  if (!category) {
    return next(
      new Error(`invalid category id ${req.params.id}`, { status: 404 })
    );
  }
  if (
    await categoryModel
      .findOne({ name: req.body.name, _id: { $ne:category._id} })
      .select("name")
  ) {
    return next(
      new Error(`category ${req.body.name} already exists`, { status: 409 })
    );
  }
  category.name = req.body.name;
  category.slug = slugify(req.body.name);
  category.status = req.body.status;

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.APP_NAME}/categories`,
      }
    );
    await cloudinary.uploader.destroy(category.image.public_id);
    category.image = { secure_url, public_id };
  }
  category.updatedBy = req.user._id;
  await category.save();
  return res.status(200).json({ message: "success" });
};
export const deleteCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  const category = await categoryModel.findByIdAndDelete(categoryId);
  if (!category) {
    return next(new Error(`category not found`, { cause: 404 }));
  }
  await productModel.deleteMany({ categoryId });
  await subcategoryModel.deleteMany({ categoryId });
  return res.status(200).json({ message: "success" });
};
