import orderModel from "../../../DB/model/order.model.js";
import reviewModel from "../../../DB/model/review.model.js";

export const create = async (req, res, next) => {
    const { productId } = req.params;
    const { comment, rating } = req.body;

    const order = await orderModel.findOne({
        userId: req.user._id,
        status: "delivered", // Fixed typo
        "products.productId": productId.toString()
    });

    if (!order) {
        return next(new Error("You cannot review this product", { cause: 400 }));
    }

    const existingReview = await reviewModel.findOne({
        createdBy: req.user._id,
        productId: productId.toString()
    });

    if (existingReview) {
        return next(new Error("You have already reviewed this product", { cause: 409 }));
    }

    const review = await reviewModel.create({
        comment,
        rating,
        createdBy: req.user._id,
        orderId: order._id,
        productId
    });

    return res.status(201).json({ message: "Success", review });
};