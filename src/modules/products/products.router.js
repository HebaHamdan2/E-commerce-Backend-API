import{Router}from 'express'
import * as productsController from './products.controller.js'
import { endPoint } from './products.endpoint.js';
import fileUpload, { fileValidation } from '../../services/multer.js';
import { auth } from '../../middleware/auth.js';
const router=Router();

router.get('/',productsController.getProducts);
router.post('/',auth(endPoint.create),fileUpload(fileValidation.image).fields([
    {name:'mainImage',maxCount:1},
    {name:'subImages',maxCount:4},
]),productsController.createProduct)
 export default router;