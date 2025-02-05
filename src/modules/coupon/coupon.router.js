import { Router } from "express";
import * as couponController from "./coupon.controller.js";
import * as validatores from "./coupon.validation.js";
import { validation } from "../../middleware/validation.js";
import { asyncHandler } from "../../services/errorHandling.js";
import { endPoint } from "./coupon.endpoint.js";
const router = Router();

router.post(
  "/",
   auth(endPoint.create),
  validation(validatores.createCoupon),
  couponController.createCoupon
);
router.get("/",  auth(endPoint.getAll),asyncHandler( couponController.getCoupons));
router.put("/:id", auth(endPoint.update),asyncHandler(couponController.updateCoupon));
router.patch("/softDelete/:id", auth(endPoint.delete),asyncHandler(couponController.softDelete));
router.delete("/hardDelete/:id", auth(endPoint.delete),asyncHandler(couponController.hardDelete));
router.patch("/restore/:id", auth(endPoint.restore),asyncHandler(couponController.restore));

export default router;
