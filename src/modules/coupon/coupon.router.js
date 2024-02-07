import { Router } from "express";
import * as couponController from "./coupon.controller.js";
import * as validatores from "./coupon.validation.js";
import { validation } from "../../middleware/validation.js";
import { asyncHandler } from "../../services/errorHandling.js";
const router = Router();

router.post(
  "/",
  validation(validatores.createCoupon),
  couponController.createCoupon
);
router.get("/", asyncHandler( couponController.getCoupons));
router.put("/:id",asyncHandler(couponController.updateCoupon));
router.patch("/softDelete/:id",asyncHandler(couponController.softDelete));
router.delete("/hardDelete/:id",asyncHandler(couponController.hardDelete));
router.patch("/restore/:id",asyncHandler(couponController.restore));

export default router;
