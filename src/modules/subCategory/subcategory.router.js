import{Router} from 'express';
import * as subcategoriesController from './subcategory.controller.js';
import fileUpload, { fileValidation } from '../../services/multer.js';


const router=Router({mergeParams:true});

router.post('/',fileUpload(fileValidation.image).single('image'),subcategoriesController.createsubCategory)
router.get('/',subcategoriesController.getSubCategories)
export default router;