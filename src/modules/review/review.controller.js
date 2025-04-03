import orderModel from "../../../DB/model/order.model.js";
import productModel from "../../../DB/model/product.model.js";
import reviewModel from "../../../DB/model/review.model.js";

export const createReview = async (req, res, next) => {
  const { productId } = req.params;
  const { comment, rating } = req.body;

  const order = await orderModel.findOne({
    userId: req.user._id,
    status: "delivered",
    "products.productId": productId,
  });

  if (!order) {
    return next(new Error(`You cannot review this product`, { cause: 400 }));
  }

  const checkReview = await reviewModel.findOne({
    createdBy: req.user._id,
    productId: productId.toString(),
  });

  if (checkReview) {
    return next(new Error(`You have already reviewed this product`, { cause: 400 }));
  }

  const review = await reviewModel.create({
    comment,
    rating,
    createdBy: req.user._id,
    orderId: order._id,
    productId,
  });

  if (!review) {
    return next(new Error(`Error while adding review`, { cause: 400 }));
  }

  await productModel.findByIdAndUpdate(productId, {
    $push: { reviews: review._id },
  });

  return res.status(201).json({ message: "Review added successfully", review });
};

export const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { comment, rating } = req.body;

    const review = await reviewModel.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You cannot update someone else's review" });
    }

    review.comment = comment || review.comment;
    review.rating = rating || review.rating;

    const updatedReview = await review.save();
    return res.status(200).json({ message: "Review updated successfully", review: updatedReview });
  } catch (error) {
    return next(error);
  }
};
export const getAlluserReviews = async (req, res, next) => {
    try {
      const reviews = await reviewModel.find({ createdBy: req.user._id });
      if (!reviews.length) {
        return res.status(404).json({ message: "No reviews found" });
      }
      return res.status(200).json({ message: "Success", reviews });
    } catch (error) {
      return next(error);
    }
  };
  export const deleteReview = async (req, res, next) => {
    try {
      const { reviewId } = req.params;
  
      const review = await reviewModel.findById(reviewId);
  
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
  
      if (review.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You cannot delete someone else's review" });
      }
  
      await review.remove();
      return res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
      return next(error);
    }
  };