import {Router} from 'express';
import{auth, roles}from '../../middleware/auth.js';
import * as userController from './user.controller.js';
import { asyncHandler } from '../../services/errorHandling.js';
import fileUpload, { fileValidation } from '../../services/multer.js';
import { endPoint } from './user.endPoint.js';
import * as valdators from "./user.validation.js"
import { validation } from '../../middleware/validation.js';
const router =Router();
router.post('/',auth(endPoint.profile),fileUpload(fileValidation.image).single('image'),validation(valdators.profile),asyncHandler(userController.profile));//change profile picture
router.patch("/updatePassword",auth(endPoint.updatePass),validation(valdators.updatePassword),asyncHandler(userController.updatePassword));//update password
router.get("/:id/profile",asyncHandler(userController.shareProfile));//share profile
router.post("/uploadUsersExcel",auth(['Admin']),fileUpload(fileValidation.excel).single('file'),asyncHandler(userController.uploadUserExcel))
export default router;