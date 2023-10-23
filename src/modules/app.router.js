import connectDB from '../../DB/connection.js';
import  categoriesRouter from './categories/categories.router.js'
import  productsRouter from './products/products.router.js'

const initApp=(app,express)=>{
    connectDB();
    app.use(express.json());
    app.get('/',(req,res)=>{
        return res.status(200).json({message:"welcome"});
    })
    app.use('/categories',categoriesRouter);
    app.use('/products',productsRouter);
    app.get("*",(req,res)=>{
        return res.status(500).json({messsage:"page not found"});
    })
    
}
export default initApp;