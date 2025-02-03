import orderModel from "../../../DB/model/order.model.js";
import productModel from "../../../DB/model/product.model.js";
import reviewModel from "../../../DB/model/review.model.js";

export const createReview = async (req, res, next) => {
  const { productId } = req.params;
  const { comment, rating } = req.body;

  // Check if the order was delivered and contains the product
  const order = await orderModel.findOne({
    userId: req.user._id,
    status: "delivered",
    "products.productId": productId,
  });
  
 
  if (!order) {
    return next(new Error("Cannot review this product", { cause: 400 }));
  }

  // Check if the user has already reviewed the product
  const checkReview = await reviewModel.findOne({
    createdBy: req.user._id,
    productId: productId.toString(),
  });
  if (checkReview) {
    return next(new Error("Already reviewed", { cause: 404 }));
  }

  // Create the new review
  const review = await reviewModel.create({
    comment,
    rating,
    createdBy: req.user._id,
    orderId: order._id,
    productId,
  });
  if (!review) {
    return next(new Error("Error while adding review", { cause: 400 }));
  }

  // After adding the review, update the product's average rating and number of ratings
  const product = await productModel.findById(productId);
  if (product) {
    // Calculate the new average rating
    const totalRatings = product.numberOfRatings + 1; // Increment the number of ratings
    const newAvgRating =
      (product.avgRating * product.numberOfRatings + rating) / totalRatings; // Weighted average

    // Update the product
    product.avgRating = newAvgRating;
    product.numberOfRatings = totalRatings;

    await product.save();
  }

  return res.status(201).json({ message: "Success", review });
};
export const getAllreviews=async(req,res,next)=>{
  const reviews=await reviewModel.find({ createdBy: req.user._id})
if(!reviews){
  return next(new Error(`you did not review anything yet`, { cause: 400 }));

}
return res.status(200).json({ message: "Success", reviews });


}