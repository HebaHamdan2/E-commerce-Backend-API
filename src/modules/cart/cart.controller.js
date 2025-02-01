import cartModel from "../../../DB/model/cart.model.js";
import productModel from "../../../DB/model/product.model.js";

export const createCart = async (req, res, next) => {
  const { productId, quantity = 1, color, size } = req.body;

  // Fetch the cart and product
  const cart = await cartModel.findOne({ userId: req.user._id });
  const product = await productModel.findById(productId);

  if (!product) {
    return next(new Error("Product not found", { cause: 404 }));
  }

  // Check if the requested quantity is available in stock for the selected color and size
  const selectedVariant = product.variants.find(
    (variant) => variant.color === color && variant.size === size
  );

  if (!selectedVariant) {
    return next(new Error("Selected color and size combination not found"));
  }

  if (selectedVariant.stock < quantity) {
    return next(new Error("Product quantity not available for this variant"));
  }

  // If cart does not exist, create a new one
  if (!cart) {
    const newCart = await cartModel.create({
      userId: req.user._id,
      products: [{ productId, quantity, color, size }],
      count: quantity,
    });
    return res.status(201).json({ message: "Cart created successfully", newCart });
  }

  // Check if the product already exists in the cart
  let matchedProduct = false;
  for (let i = 0; i < cart.products.length; i++) {
    if (
      cart.products[i].productId.toString() === productId &&
      cart.products[i].color === color &&
      cart.products[i].size === size
    ) {
      // Update the product quantity
      cart.products[i].quantity += quantity;
      if (selectedVariant.stock < cart.products[i].quantity) {
        return next(new Error("Product quantity not available for this variant"));
      }
      matchedProduct = true;
      break;
    }
  }

  // If the product is not in the cart, add it
  if (!matchedProduct) {
    cart.products.push({ productId, quantity, color, size });
  }

  // Update the count of items in the cart
  cart.count = cart.products.reduce((acc, item) => acc + item.quantity, 0);

  // Save the updated cart
  await cart.save();
  return res.status(200).json({ message: "Cart updated successfully", cart });
};


export const removeItem = async (req, res) => {
  const { productId } = req.body;
  await cartModel.updateOne(
    { userId: req.user._id },
    {
      $pull: {
        products: {
          productId,
        },
      },
    }
  );
  return res.status(200).json({ message: "success" });
};
export const clearCart = async (req, res) => {
  const clearCart = await cartModel.updateOne(
    { userId: req.user._id },
    { products: [] }
  );
  return res.status(200).json({ message: "success" });
};
export const getCart = async (req, res) => {
  const cart = await cartModel
    .findOne({ userId: req.user._id })
    .populate("products.productId"); // Make sure this is correctly populated

  return res.status(200).json({ message: "Success", cart });
};

export const updateCart = async (req, res, next) => {
  const { productId } = req.params;
  const { quantity, color, size } = req.body;

  // Find the cart
  const cart = await cartModel.findOne({ userId: req.user._id });

  // Check if the cart contains the product with the specific color and size
  const productInCart = cart.products.find(
    (item) => item.productId.toString() === productId && item.color === color && item.size === size
  );

  if (!productInCart) {
    return next(new Error("Product with selected color and size not found in the cart"));
  }

  // Fetch the product and check stock for the selected variant
  const product = await productModel.findById(productId);
  const selectedVariant = product.variants.find(
    (variant) => variant.color === color && variant.size === size
  );

  if (selectedVariant && selectedVariant.stock < quantity) {
    return next(new Error("Product quantity not available for this variant"));
  }

  // Update the quantity in the cart
  productInCart.quantity = quantity;

  // Recalculate the total item count in the cart
  cart.count = cart.products.reduce((acc, item) => acc + item.quantity, 0);

  // Save the updated cart
  await cart.save();
  return res.status(200).json({ message: "Cart updated successfully", cart });
};
