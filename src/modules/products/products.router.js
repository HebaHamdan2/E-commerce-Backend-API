import { Router } from "express";
import * as productsController from "./products.controller.js";
import { endPoint } from "./products.endpoint.js";
import fileUpload, { fileValidation } from "../../services/multer.js";
import { auth } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import * as validators from "./products.validation.js";
const router = Router();

router.get("/", productsController.getProducts);
router.post(
  "/",
  auth(endPoint.create),
  fileUpload(fileValidation.image).fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImages", maxCount: 4 },
  ]),
  productsController.createProduct, 
  validation(validators.createProduct)//the validation should be after adding files to make sure that validates for everything 
);
router.get("/category/:categoryId", productsController.getProductWithCategory);
router.get("/:productId", productsController.getProduct);
export default router;
