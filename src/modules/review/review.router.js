import {Router} from "express"
import * as reviewController from "./review.controller.js";
import { auth } from "../../middleware/auth.js";
import { endPoint } from "./review.endPoint.js";
import { asyncHandler } from "../../services/errorHandling.js";
const router=Router();
// CRUD
router.post("/:productId",auth(endPoint.create),asyncHandler(reviewController.createReview));
router.get("/get",auth(endPoint.get),asyncHandler(reviewController.getAlluserReviews));
router.patch("/update/:reviewId",auth(endPoint.update),asyncHandler(reviewController.updateReview));
router.delete("/delete/:reviewId",auth(endPoint.delete),asyncHandler(reviewController.deleteReview));

export default router;