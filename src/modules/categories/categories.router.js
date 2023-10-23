import{Router} from 'express';
import * as categoriesController from './categories.controller.js';
import fileUpload, { fileValidation } from '../../services/multer.js';


const router=Router();

router.get('/',categoriesController.getCategories);
router.post('/',fileUpload(fileValidation.image).single('image'),categoriesController.createCategory)
export default router;