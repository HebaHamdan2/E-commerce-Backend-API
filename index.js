import 'dotenv/config'
import express from 'express'
import initApp from './src/modules/app.router.js';
const app=express();
app.use(express.json());
const PORT=process.env.PORT||3000;
initApp(app,express);
app.listen(PORT,()=>{
    console.log(`server is running ...${PORT}`);
})