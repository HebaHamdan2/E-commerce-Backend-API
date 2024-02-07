import cartModel from "../../../DB/model/cart.model.js";
import productModel from "../../../DB/model/product.model.js";

export const createCart = async (req, res,next) => {
  const { productId } = req.body;
  const quantity=req.body.quantity || 1;

  const cart = await cartModel.findOne({ userId: req.user._id })
  const product=await productModel.findById(productId);
  if(product.stock<quantity){
    return next(new Error("product quantity not available"))
  }
  if (!cart) {
    const newCart = await cartModel.create({
      userId: req.user._id,
      products: { productId, quantity },
      count:quantity
    });
    return res.status(201).json({ message: "success", newCart });
  }
  let matchedProduct = false;
  for (let i = 0; i < cart.products.length; i++) {
    if (cart.products[i].productId == productId) {
      if(req.body.quantity){
        cart.products[i].quantity = quantity;
      }else{
        cart.products[i].quantity+=1;
       
      }
      if(product.stock<cart.products[i].quantity){
        return next(new Error("product quantity not available"))
      }
      matchedProduct = true;
      break;
    }
  }
  let count=0;
  for (let i = 0; i < cart.products.length; i++) {
   
        count+=cart.products[i].quantity;
           
  }
  cart.count=count;

  if (!matchedProduct) {
    cart.products.push({ productId, quantity });
  }

  await cart.save();
  return res.status(201).json({ message: "success", cart });
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
  const cart = await cartModel.findOne({ userId: req.user._id }).populate("products.productId");
  return res.status(200).json({ message: "success", cart: cart });
};
export const updateCart =async (req,res)=>{
const{productId}=req.params;
const{quantity}=req.body;
const cart = await cartModel.findOne({userId:req.user._id});
for(const product of cart.products){
  if(product.productId==productId){
    product.quantity=quantity;
  }
}
await cart.save();
return res.status(200).json({message:"success",cart});

}
