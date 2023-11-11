import {Router} from 'express';
import * as AuthController from './auth.controller.js'
import fileUpload, { fileValidation } from '../../services/multer.js';
const router=Router();
router.post('/signup',fileUpload(fileValidation.image).single('image'),AuthController.signUp)
router.post('/signin',AuthController.signIn);
router.get('/confirmEmail/:token',AuthController.confirmEmail)
export default router;