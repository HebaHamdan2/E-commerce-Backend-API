import { Router } from "express";
import * as orderController from "./order.controller.js";
import { endPoint } from "./order.endPoints.js";
import { auth } from "../../middleware/auth.js";
const router = Router();

router.post("/create", auth(endPoint.create), orderController.createOrder);
export default router;
