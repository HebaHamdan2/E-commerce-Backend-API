import { Router } from "express";
import * as AuthController from "./auth.controller.js";
import fileUpload, { fileValidation } from "../../services/multer.js";
import { asyncHandler } from "../../services/errorHandling.js";
const router = Router();
router.post(
  "/signup",
  asyncHandler(AuthController.signUp)
);
router.post("/signin", AuthController.signIn);
router.get("/confirmEmail/:token", AuthController.confirmEmail);
router.patch("/sendcode", AuthController.sendCode);
router.patch("/forgetPasseword", AuthController.forgetPasseword);
router.delete("/invalidConfirm", AuthController.deleteInvalidConfirm);
export default router;
