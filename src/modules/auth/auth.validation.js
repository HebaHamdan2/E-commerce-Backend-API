import joi from 'joi';
import { generalFields } from '../../middleware/validation.js';

export const signupSchema=  joi.object( {
        userName:joi.string().alphanum().required(),
        email:generalFields.email,
        password:generalFields.password,
        cPassword:joi.valid(joi.ref('password')).required(),
        })
//   query:joi.object({test:joi.boolean().required()})


export const signinSchema=joi.object({
email:generalFields.email,
password:generalFields.password

})
