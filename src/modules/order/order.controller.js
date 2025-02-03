import cartModel from "../../../DB/model/cart.model.js";
import couponModel from "../../../DB/model/coupon.model.js";
import orderModel from "../../../DB/model/order.model.js";
import productModel from "../../../DB/model/product.model.js";
import userModel from "../../../DB/model/user.model.js";

export const createOrder = async (req, res, next) => {
  const { couponName } = req.body;
  const cart = await cartModel.findOne({ userId: req.user._id });

  if (!cart||cart.products.length===0) {
    return next(new Error(`Cart is empty`, { cause: 400 }));
  }

  req.body.products = cart.products;

  // Apply coupon logic if applicable
  if (couponName) {
    const coupon = await couponModel.findOne({ name: couponName });
    if (!coupon) {
      return next(new Error(`Coupon not found`, { cause: 404 }));
    }
    const currentDate = new Date();
    if (coupon.expireDate <= currentDate) {
      return next(new Error(`This coupon has expired`, { cause: 400 }));
    }
    if (coupon.usedBy.includes(req.user._id)) {
      return next(new Error(`Coupon already used`, { cause: 409 }));
    }
    req.body.coupon = coupon;
  }

  let subTotals = 0;
  let finalProductList = [];

  // Loop through the products in the cart and validate stock
  for (let product of req.body.products) {
    const { productId, quantity, color, size } = product;

    const checkProduct = await productModel.findOne({ _id: productId });
    if (!checkProduct) {
      return next(new Error(`Product not found`, { cause: 404 }));
    }

    // Find the specific variant (color/size combination) in the product
    const variant = checkProduct.variants.find(
      (v) => v.color === color && v.size === size
    );

    if (!variant) {
      return next(new Error(`Variant not available`, { cause: 400 }));
    }

    // Check if enough stock is available for this variant
    if (variant.stockPerOne < quantity) {
      return next(new Error(`Not enough stock for the selected variant`, { cause: 400 }));
    }

    // Add product details (including variant) to the final product list
    product = product.toObject();
    product.name = checkProduct.name;
    product.unitPrice = checkProduct.price;
    product.discount = checkProduct.discount;
    product.finalPrice = quantity * checkProduct.finalPrice;

    // Update the subtotal
    subTotals += product.finalPrice;
    finalProductList.push(product);
  }

  const user = await userModel.findById(req.user._id);
  if (!req.body.address) {
    req.body.address = user.address;
  }
  if (!req.body.phone) {
    req.body.phone = user.phone;
  }

  // Create the order
  const order = await orderModel.create({
    userId: req.user._id,
    products: finalProductList,
    finalPrice: subTotals - (subTotals * (req.body.coupon?.amount || 0)) / 100,
    address: req.body.address,
    phoneNumber: req.body.phone,
    couponName: req.body.couponName ?? "",
  });

  // Decrease stock for each product variant in the order
  for (let product of req.body.products) {
    const { productId, quantity, color, size } = product;

    // Find the product and its variant
    const productInDb = await productModel.findOne({ _id: productId });
    const variant = productInDb.variants.find(
      (v) => v.color === color && v.size === size
    );

    // Update stock for the selected variant
    if (variant) {
      await productModel.updateOne(
        { _id: productId, "variants.color": color, "variants.size": size },
        { $inc: { "variants.$.stockPerOne": -quantity } }
      );
    }
  }

  // Update coupon usage if applicable
  if (req.body.coupon) {
    await couponModel.updateOne(
      { _id: req.body.coupon._id },
      { $addToSet: { usedBy: req.user._id } }
    );
  }

  // Clear the cart
  await cartModel.updateOne({ userId: req.user._id }, { products: [] });

  return res.status(201).json({ message: "Success", order });
};
export const cancelOreder = async (req, res, next) => {
  const { orderId } = req.params;
  const order = await orderModel.findOne({ _id: orderId, userId: req.user._id });
  
  if (!order) {
    return next(new Error(`Invalid order`, { cause: 404 }));
  }

  if (order.status !== "pending") {
    return next(new Error(`Can't cancel this order`));
  }

  req.body.status = "cancelled";
  req.body.updatedBy = req.user._id;

  const newOrder = await orderModel.findByIdAndUpdate(orderId, req.body, { new: true });

  // Restore stock for each product variant
  for (const product of order.products) {
    const { productId, quantity, variantColor, variantSize } = product;
    
    const productInDb = await productModel.findOne({ _id: productId });
    const variant = productInDb.variants.find(
      (v) => v.color === variantColor && v.size === variantSize
    );
    
    if (variant) {
      await productModel.updateOne(
        { _id: productId, "variants.color": variantColor, "variants.size": variantSize },
        { $inc: { "variants.$.stockPerOne": quantity } }
      );
    }
  }

  if (order.couponName) {
    await couponModel.updateOne(
      { name: order.couponName },
      { $pull: { usedBy: req.user._id } }
    );
  }

  return res.json({ message: "success", order: newOrder });
};

export const changeStatus = async (req, res, next) => {
  const { orderId } = req.params;
  const order = await orderModel.findById(orderId);

  if (!order) {
    return next(new Error(`Order not found`, { cause: 404 }));
  }

  if (order.status === "cancelled" || order.status === "deliverd") {
    return next(new Error(`Can't change this order's status`));
  }

  if (req.body.status === "cancelled") {
    for (const product of order.products) {
      const { productId, quantity, variantColor, variantSize } = product;
      
      const productInDb = await productModel.findOne({ _id: productId });
      const variant = productInDb.variants.find(
        (v) => v.color === variantColor && v.size === variantSize
      );
      
      if (variant) {
        await productModel.updateOne(
          { _id: productId, "variants.color": variantColor, "variants.size": variantSize },
          { $inc: { "variants.$.stockPerOne": quantity } }
        );
      }
    }

    if (order.couponName) {
      await couponModel.updateOne(
        { name: order.couponName },
        { $pull: { usedBy: order.userId } }
      );
    }
  }

  const newOrder = await orderModel.findByIdAndUpdate(orderId, { status: req.body.status }, { new: true });

  return res.json({ message: "success", newOrder });
};


export const getOrder = async (req, res, next) => {
  const orders = await orderModel.find({ userId: req.user._id });
  return res.status(200).json({ message: "success", orders });
};

