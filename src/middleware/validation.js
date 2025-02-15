import joi from "joi";

export const generalFields = {
  // id:joi.string().min(24).max(24).custom(validationObjectId).required(),
  email: joi.string().email().required().min(5).messages({
    "string.email": "plz enter a valid email",
    "string.empty": "email is required",
  }),
  password: joi.string().required().min(3).messages({
    "string.empty": "password is required",
  }),
  file: joi.object({
    size: joi.number().positive().required(),
    path: joi.string().required(),
    filename: joi.string().required(),
    destination: joi.string().required(),
    mimetype: joi.string().required(),
    encoding: joi.string().required(),
    originalname: joi.string().required(),
    fieldname: joi.string().required(),
    dest: joi.string(),
  }),
  userName: joi.string().min(4).max(20),
  phone: joi.string().pattern(/^[0-9]+$/).optional(),  
  address: joi.string().max(200).optional(),
  gender: joi.string().valid("Male", "Female").optional(),
};

export const validation = (schema) => {
  return (req, res, next) => {
    const inputData = { ...req.body, ...req.params, ...req.query };
    if (req.file || req.files) {
      inputData.file = req.file || req.files;
    }
    const validationResult = schema.validate(inputData, { abortEarly: false });
    if (validationResult.error?.details) {
      return res
        .status(400)
        .json({
          message: "validation error",
          validationError: validationResult.error?.details,
        });
    }
    next();
  };
};
