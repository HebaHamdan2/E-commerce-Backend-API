import userModel from "../../../DB/model/user.model.js"
import XLSX  from "xlsx";
import bcrypt from "bcryptjs";
import cloudinary from "../../services/cloudinary.js";
export const profile= async(req,res,next)=>{
    const {secure_url,public_id}=await cloudinary.uploader.upload(req.file.path,{
        folder:`${process.env.APP_NAME}/user/${req.user._id}/profile`
    })
    if(!req.file){
        return next(new Error("please provide a file"))
    }
    const user =await userModel.findByIdAndUpdate(req.user._id,{profilePic:{secure_url,public_id}},{new:false});
    if(user.profilePic){
        await cloudinary.uploader.destroy(user.profilePic.public_id);
    }
    
    return res.json({message:user});
    }
 export const updatePassword=async(req,res,next)=>{
        const {oldPassword,newPassword}=req.body;
        const user=await userModel.findById(req.user._id);
        const match=bcrypt.compareSync(oldPassword,user.password);
        if(!match){
            return next(new Error("invalid old password"));
        }
        const hashPassword=bcrypt.hashSync(newPassword,parseInt(process.env.SALTROUND));
        user.password=hashPassword;
        user.save();
        return res.status(200).json({message:"success"});
    }
 export const shareProfile=async(req,res,next)=>{
        const user=await userModel.findById(req.params.id).select('userName email')
        if(!user){
            return next(new Error('User not found'));
        }
        return res.status(200).json({message:'success',user});
    }
export const uploadUserExcel=async(req,res,next)=>{
const woorkBook= XLSX.readFile(req.file.path);
const woorkSheet=woorkBook.Sheets[woorkBook.SheetNames[0]];//specified the page to read
const users=XLSX.utils.sheet_to_json(woorkSheet);//convert to JsON
if(!await userModel.insertMany(users)){
    return next(new Error(`Could not insert`,{cause:400}));

}
return res.status(201).json({message:"success"});
}