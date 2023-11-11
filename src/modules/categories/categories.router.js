import{Router} from 'express';
import * as categoriesController from './categories.controller.js';
import  subCategoryRouter from './../subCategory/subcategory.router.js'
import fileUpload, { fileValidation } from '../../services/multer.js';
import { auth } from '../../middleware/auth.js';
import { endPoint } from './category.endpoint.js';
const router=Router();
router.use('/:id/subcategory',subCategoryRouter);
router.get('/',auth(endPoint.getAlls),categoriesController.getCategories);
router.get('/active',auth(endPoint.getActive),categoriesController.getActiveCategory)
router.get('/:id',auth(endPoint.specific),categoriesController.SpecificCategory);
router.post('/',auth(endPoint.create),fileUpload(fileValidation.image).single('image'),categoriesController.createCategory)
router.put('/:id',auth(endPoint.update),fileUpload(fileValidation.image).single('image'),categoriesController.updateCategory)
export default router;