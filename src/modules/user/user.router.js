import {Router} from 'express';
import{auth, roles}from '../../middleware/auth.js';
import * as userController from './user.controller.js';
import { asyncHandler } from '../../services/errorHandling.js';
const router =Router();
router.get('/profile',auth(Object.values(roles)),asyncHandler(userController.getProfile));
export default router;