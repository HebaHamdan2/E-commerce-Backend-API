import{Router} from 'express';
import * as subcategoriesController from './subcategory.controller.js';
import fileUpload, { fileValidation } from '../../services/multer.js';
import { asyncHandler } from '../../services/errorHandling.js';


const router=Router({mergeParams:true});

router.post('/',fileUpload(fileValidation.image).single('image'),asyncHandler(subcategoriesController.createsubCategory))
router.get('/', asyncHandler(subcategoriesController.getSubCategories))
export default router;