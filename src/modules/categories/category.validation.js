import joi from 'joi';
import { generalFields } from '../../middleware/validation.js';

export const createCategory=joi.object({
name:joi.string().min(3).max(25).required(),
file:generalFields.file.required(),
//file:joi.array().items(generalFields.file.required()).required
})
export const getSpecificCategory=joi.object({
    id:joi.string().min(24).max(24).required(),
})