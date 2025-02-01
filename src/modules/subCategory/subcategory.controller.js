import slugify from "slugify";
import categoryModel from "../../../DB/model/category.model.js";
import subcategoryModel from "../../../DB/model/subCategory.model.js";

export const createsubCategory=async(req,res,next)=>{
const{name,categoryId}=req.body;
const subcategory=await subcategoryModel.findOne({name});
if(subcategory){
    return next(new Error(`sub category ${name} already exists`,{cause:409}));

}
const category=await categoryModel.findById(categoryId);
if(!category){
    return next(new Error(`category not found`,{cause:404}));

}

const subCategory=await subcategoryModel.create({name,slug:slugify(name),categoryId})
return res.status(201).json({message:"success",subCategory});
}
export const getSubCategories=async(req,res,next)=>{
    const categoryId=req.params.id;
    const category=await categoryModel.findById(categoryId)
    if(!category){
        return next(new Error(`category not found`,{cause:404}));
    }
    const subcategories=await subcategoryModel.find({categoryId}).populate({
        path:'categoryId'
    });
    return res.status(200).json({message:"success",subcategories})
}