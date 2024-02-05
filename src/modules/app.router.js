import connectDB from "../../DB/connection.js";
import categoriesRouter from "./categories/categories.router.js";
import productsRouter from "./products/products.router.js";
import authRouter from "./auth/auth.router.js";
import subCategoryRouter from "./subCategory/subcategory.router.js";
import couponRouter from "./coupon/coupon.router.js";
import cartRouter from "./cart/cart.router.js";
import orderRouter from "./order/order.router.js";
import userRouter from "./user/user.router.js";
import cors from "cors"
import { globalErrorHandler } from "../services/errorHandling.js";
const initApp = async (app, express) => {
<<<<<<< HEAD
 
  app.use(cors(
  ));
=======
  // let whitelist=['https://apiecommerce-hblh.onrender.com']
  // if( !whitelist.includes(req.header('origin'))){
  //   return next(new Error(`invalid`,{cause:403}))
  // }else{
  //   next()
  // }
  // app.use(cors());
>>>>>>> 1d4acf9198fcb6e865671752b4d73b94c67786fb
  connectDB();
  app.use(express.json());
  app.get("/", (req, res) => {
    return res.status(200).json({ message: "welcome" });
  });
  app.use("/auth", authRouter);
  app.use("/categories", categoriesRouter);
  app.use("/coupon", couponRouter);
  app.use("/subcategory", subCategoryRouter);
  app.use("/products", productsRouter);
  app.use("/cart", cartRouter);
  app.use("/order", orderRouter);
  app.use("/user", userRouter);
  app.get("*", (req, res) => {
    return res.status(500).json({ messsage: "page not found" });
  });
  app.use(globalErrorHandler);
};
export default initApp;
