import {Router} from "express"
import * as reviewController from "./review.controller.js";
import { auth } from "../../middleware/auth.js";
import { endPoint } from "./review.endPoint.js";
import { asyncHandler } from "../../services/errorHandling.js";
const router=Router();
router.post("/:productId",auth(endPoint.create),asyncHandler(reviewController.createReview));
router.get("/get",auth(endPoint.get),asyncHandler(reviewController.getAllreviews));
export default router;