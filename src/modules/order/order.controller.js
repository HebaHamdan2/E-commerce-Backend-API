import cartModel from "../../../DB/model/cart.model.js";
import couponModel from "../../../DB/model/coupon.model.js";
import orderModel from "../../../DB/model/order.model.js";
import productModel from "../../../DB/model/product.model.js";
import userModel from "../../../DB/model/user.model.js";

export const createOrder = async (req, res, next) => {
  const { couponName } = req.body;
  const cart = await cartModel.findOne({ userId: req.user._id });
  if (!cart || cart.products.length === 0) {
    return next(new Error("Cart is empty", { cause: 400 }));
  }

  req.body.products = cart.products;

  if (couponName) {
    const coupon = await couponModel.findOne({ name: couponName });
    if (!coupon) return next(new Error("Coupon not found", { cause: 404 }));
    
    const currentDate = new Date();
    if (coupon.expireDate <= currentDate) {
      return next(new Error("This coupon has expired", { cause: 400 }));
    }
    if (coupon.usedBy.includes(req.user._id)) {
      return next(new Error("Coupon already used", { cause: 409 }));
    }
    req.body.coupon = coupon;
  }

  let subTotals = 0;
  const finalProductList = [];

  for (let product of req.body.products) {
    const checkProduct = await productModel.findOne({
      _id: product.productId,
      stock: { $gte: product.quantity },
    });

    if (!checkProduct) {
      return next(new Error("Product quantity not available"));
    }

    product = product.toObject();
    product.name = checkProduct.name;
    product.unitPrice = checkProduct.price;
    product.discount = checkProduct.discount;
    product.finalPrice = product.quantity * checkProduct.finalPrice;
    subTotals += product.finalPrice;

    finalProductList.push(product);
  }

  const user = await userModel.findById(req.user._id);
  req.body.address = req.body.address || user.address;
  req.body.phone = req.body.phone || user.phone;

  const order = await orderModel.create({
    userId: req.user._id,
    products: finalProductList,
    finalPrice: subTotals - (subTotals * (req.body.coupon?.amount || 0)) / 100,
    address: req.body.address,
    phoneNumber: req.body.phone,
    couponName: req.body.couponName || "",
  });

  for (let product of req.body.products) {
    await productModel.updateOne(
      { _id: product.productId },
      { $inc: { stock: -product.quantity } }
    );
  }

  if (req.body.coupon) {
    await couponModel.updateOne(
      { _id: req.body.coupon._id },
      { $addToSet: { usedBy: req.user._id } }
    );
  }

  await cartModel.updateOne(
    { userId: req.user._id },
    { products: [] }
  );

  return res.status(201).json({ message: "Success", order });
};

export const cancelOrder = async (req, res, next) => {
  const { orderId } = req.params;
  const order = await orderModel.findOne({
    _id: orderId,
    userId: req.user._id,
  });

  if (!order) return next(new Error("Invalid order", { cause: 404 }));

  if (order.status !== "pending") {
    return next(new Error("Can't cancel this order"));
  }

  req.body.status = "cancelled";
  req.body.updatedBy = req.user._id;

  const newOrder = await orderModel.findByIdAndUpdate(orderId, req.body, {
    new: true,
  });

  for (const product of order.products) {
    await productModel.updateOne(
      { _id: product.productId },
      { $inc: { stock: product.quantity } }
    );
  }

  if (order.couponName) {
    await couponModel.updateOne(
      { name: order.couponName },
      { $pull: { usedBy: req.user._id } }
    );
  }

  return res.json({ message: "Success", order: newOrder });
};

export const getOrder = async (req, res, next) => {
  const orders = await orderModel.find({ userId: req.user._id }).populate("products.productId");
  return res.status(200).json({ message: "Success", orders });
};

export const changeStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) return next(new Error("Order not found", { cause: 404 }));

    // Allowed status transitions
    const nonChangeableStatuses = ["cancelled", "delivered"];
    if (nonChangeableStatuses.includes(order.status)) {
      return next(new Error("Can't change status of this order", { cause: 400 }));
    }

    // Validate new status
    const validStatuses = ["pending", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return next(new Error("Invalid status provided", { cause: 400 }));
    }

    // If order is canceled, restore stock and update coupon usage
    if (status === "cancelled") {
      await Promise.all(
        order.products.map(async (product) => {
          await productModel.updateOne(
            { _id: product.productId },
            { $inc: { stock: product.quantity } }
          );
        })
      );

      if (order.couponName) {
        await couponModel.updateOne(
          { name: order.couponName },
          { $pull: { usedBy: order.userId } }
        );
      }
    }

    // Update the order status
    order.status = status;
    await order.save();

    return res.json({ message: "Success", order });
  } catch (error) {
    return next(error);
  }
};
