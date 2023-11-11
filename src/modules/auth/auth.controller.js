import userModel from "../../../DB/model/user.model.js";
import bcrypt from'bcryptjs';
import cloudinary from "../../services/cloudinary.js";
import jwt from 'jsonwebtoken';
import { sendEmail } from "../../services/email.js";
export const signUp=async(req,res)=>{
   try{
    const {userName,email,password}=req.body;

    const user=await userModel.findOne({email});
    if(user){
        return res.status(409).json({message:"email already exists"});
    }
    const hashedPassword= bcrypt.hashSync(password,parseInt(process.env.SALT_ROUND));
    const {secure_url,public_id}= await cloudinary.uploader.upload(req.file.path,{
        folder:`${process.env.APP_NAME}/users`
    })
     const token=jwt.sign({email},process.env.CONFIRMEMAILSECRET);
    await sendEmail(email,"confirm email",`<a href='http://localhost:3000/auth/confirmEmail/${token}'>verify</a>`);
   
    const createUser=await userModel.create({userName,email,password:hashedPassword,image:{secure_url,public_id}})
   return res.status(201).json({message:"success",createUser})
   
}catch(err){return res.json({message:"error",err:err.stack})}
   
}
export const signIn=async(req,res)=>{
    const {email,password}=req.body;
    const user=await userModel.findOne({email});
    if(!user){
        return res.status(400).json({message:"data invalid"})
    }
    const match =await bcrypt.compare(password,user.password);
    if(!match){
        return res.status(200).json({message:"success",user});

    }
    const token =jwt.sign({id:user._id,role:user.role,status:user.status},process.env.LOGINSECRET,{expiresIn:'5m'});
    const refreshToken=jwt.sign({id:user._id,role:user.role,status:user.status},process.env.LOGINSECRET,{expiresIn:60*60*24*30})
   return res.status(200).json({message:"success",token,refreshToken})
}
export const confirmEmail=async(req,res)=>{
 const token=req.params.token;
 const decoded=jwt.verify(token,process.env.CONFIRMEMAILSECRET);
 if(!decoded){
    return res.status(404).json({message:"invalid token"});

 }
 const user =await userModel.findOneAndUpdate({email:decoded.email,confirmEmail:false},{confirmEmail:true});
 if(!user){
    return res.status(400).json({message:"your email is verified"});
    
 }
}
