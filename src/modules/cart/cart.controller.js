import cartModel from "../../../DB/model/cart.model.js";
import productModel from "../../../DB/model/product.model.js";

export const createCart = async (req, res, next) => {
  const { productId } = req.body;
  const quantity = req.body.quantity || 1;

  const product = await productModel.findById(productId);
  if (!product) return next(new Error("Product not found"));

  if (product.stock < quantity) {
    return next(new Error("Product quantity not available"));
  }

  let cart = await cartModel.findOne({ userId: req.user._id });

  if (!cart) {
    const newCart = await cartModel.create({
      userId: req.user._id,
      products: [{ productId, quantity }],
    });
    return res.status(201).json({ message: "success", cart: newCart });
  }

  let matchedProduct = cart.products.find((p) => p.productId.toString() === productId);

  if (matchedProduct) {
    matchedProduct.quantity = req.body.quantity ? quantity : matchedProduct.quantity + 1;
    if (product.stock < matchedProduct.quantity) {
      return next(new Error("Product quantity not available"));
    }
  } else {
    cart.products.push({ productId, quantity });
  }

  await cart.save();
  return res.status(201).json({ message: "success", cart });
};

export const removeItem = async (req, res) => {
  const { productId } = req.body;

  await cartModel.updateOne(
    { userId: req.user._id },
    { $pull: { products: { productId } } }
  );

  return res.status(200).json({ message: "Item removed successfully" });
};

export const clearCart = async (req, res) => {
  await cartModel.updateOne(
    { userId: req.user._id },
    { $set: { products: [] } }
  );

  return res.status(200).json({ message: "Cart cleared successfully" });
};

export const getCart = async (req, res) => {
  const cart = await cartModel
    .findOne({ userId: req.user._id })
    .populate("products.productId", "name price mainImage");

  return res.status(200).json({ message: "success", cart });
};

export const updateCart = async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await cartModel.findOne({ userId: req.user._id });
  if (!cart) return next(new Error("Cart not found"));

  let productInCart = cart.products.find((p) => p.productId.toString() === productId);
  if (!productInCart) return next(new Error("Product not in cart"));

  const product = await productModel.findById(productId);
  if (!product || product.stock < quantity) {
    return next(new Error("Product quantity not available"));
  }

  productInCart.quantity = quantity;
  await cart.save();

  return res.status(200).json({ message: "Cart updated successfully", cart });
};