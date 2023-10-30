import{Router} from 'express';
import * as categoriesController from './categories.controller.js';
import fileUpload, { fileValidation } from '../../services/multer.js';


const router=Router();

router.get('/',categoriesController.getCategories);
router.get('/active',categoriesController.getActiveCategory)
router.get('/:id',categoriesController.SpecificCategory);
router.post('/',fileUpload(fileValidation.image).single('image'),categoriesController.createCategory)
router.put('/:id',fileUpload(fileValidation.image).single('image'),categoriesController.updateCategory)
export default router;