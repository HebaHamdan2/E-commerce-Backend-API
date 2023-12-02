import { Router } from "express";
import * as categoriesController from "./categories.controller.js";
import subCategoryRouter from "./../subCategory/subcategory.router.js";
import fileUpload, { fileValidation } from "../../services/multer.js";
import { auth, roles } from "../../middleware/auth.js";
import { endPoint } from "./category.endpoint.js";
import { asyncHandler } from "../../services/errorHandling.js";
import * as validators from "./category.validation.js";
import { validation } from "../../middleware/validation.js";
const router = Router();
router.use("/:id/subcategory", subCategoryRouter);
router.get(
  "/",
  auth(Object.values(roles)),
  asyncHandler(categoriesController.getCategories)
);
router.get(
  "/active",
  auth(endPoint.getActive),
  asyncHandler(categoriesController.getActiveCategory)
);
router.get(
  "/:id",
  validation(validators.getSpecificCategory),
  auth(endPoint.specific),
  asyncHandler(categoriesController.SpecificCategory)
);
router.post(
  "/",
  validation(validators.createCategory),
  auth(endPoint.create),
  fileUpload(fileValidation.image).single("image"),
  categoriesController.createCategory
);
router.put(
  "/:id",
  auth(endPoint.update),
  fileUpload(fileValidation.image).single("image"),
  asyncHandler(categoriesController.updateCategory)
);

export default router;
