import { Router } from "express";
import * as couponController from "./coupon.controller.js";
import * as validatores from "./coupon.validation.js";
import { validation } from "../../middleware/validation.js";
const router = Router();

router.post(
  "/",
  validation(validatores.createCoupon),
  couponController.createCoupon
);
router.get("/", couponController.getCoupons);
router.put("/:id", couponController.updateCoupon);
router.patch("/softDelete/:id", couponController.softDelete);
router.delete("/hardDelete/:id", couponController.hardDelete);
router.patch("/restore/:id", couponController.restore);

export default router;
