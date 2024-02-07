import { Router } from "express";
import * as AuthController from "./auth.controller.js";
import fileUpload, { fileValidation } from "../../services/multer.js";
import { asyncHandler } from "../../services/errorHandling.js";
import { validation } from "../../middleware/validation.js";
import * as validators from "./auth.validation.js";
const router = Router();
router.post(
  "/signup",validation(validators.signupSchema),
  asyncHandler(AuthController.signUp)
);
router.post("/signin", validation(validators.signinSchema), asyncHandler(AuthController.signIn));
router.get("/confirmEmail/:token", AuthController.confirmEmail);
router.patch("/sendcode", AuthController.sendCode);
router.patch("/forgetPasseword", AuthController.forgetPasseword);
router.delete("/invalidConfirm", AuthController.deleteInvalidConfirm);
export default router;
