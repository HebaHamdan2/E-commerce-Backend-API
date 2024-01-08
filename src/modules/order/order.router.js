import { Router } from "express";
import * as orderController from "./order.controller.js";
import { endPoint } from "./order.endPoints.js";
import { auth } from "../../middleware/auth.js";
import { asyncHandler } from "../../services/errorHandling.js";
const router = Router();

router.post("/create", auth(endPoint.create),asyncHandler(orderController.createOrder));
router.patch('/cancel/:orderId',auth(endPoint.cancel),asyncHandler(orderController.cancelOreder));
router.get('/',auth(endPoint.get),asyncHandler(orderController.getOrder));
router.patch('/changeStatus/:orderId',auth(endPoint.change),asyncHandler(orderController.changeStatus));
export default router;
