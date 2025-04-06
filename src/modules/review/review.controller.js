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

  const product = await productModel.findById(productId).populate("reviews");
  const totalReviews = product.reviews.length;
  const totalRating = product.reviews.reduce((acc, review) => acc + review.rating, 0);
  product.avgRating = totalReviews ? totalRating / totalReviews : 0;

  await product.save();

  return res.status(201).json({ message: "Review added successfully", review, avgRating: product.avgRating });
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

    const product = await productModel.findById(updatedReview.productId).populate("reviews");
    const totalReviews = product.reviews.length;
    const totalRating = product.reviews.reduce((acc, rev) => acc + rev.rating, 0);
    product.avgRating = totalReviews ? totalRating / totalReviews : 0;

    await product.save();

    return res.status(200).json({ message: "Review updated successfully", review: updatedReview, avgRating: product.avgRating });
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
  
      const product = await productModel.findById(review.productId);
  
      const deletedRating = review.rating;
  
      await reviewModel.findByIdAndDelete(reviewId);
      const totalReviews = product.reviews.length - 1;
      const totalRating = product.reviews.reduce((acc, rev) => acc + rev.rating, 0) - deletedRating;
      product.avgRating = totalReviews > 0 ? totalRating / totalReviews : 0;
  
      // Remove review from product.reviews array
      product.reviews = product.reviews.filter(r => r.toString() !== reviewId);
  
      await product.save();
  
      return res.status(200).json({ message: "Review deleted successfully", avgRating: product.avgRating });
    } catch (error) {
      return next(error);
    }
  };
  