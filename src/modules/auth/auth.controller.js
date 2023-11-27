import userModel from "../../../DB/model/user.model.js";
import bcrypt from'bcryptjs';
import cloudinary from "../../services/cloudinary.js";
import jwt from 'jsonwebtoken';
import { sendEmail } from "../../services/email.js";
import { customAlphabet, nanoid } from 'nanoid'
export const signUp=async(req,res,next)=>{
   try{
    const {userName,email,password}=req.body;

    const user=await userModel.findOne({email});
    if(user){
        return next(new Error("email already exists",{cause:409}))
    }
    const hashedPassword= bcrypt.hashSync(password,parseInt(process.env.SALT_ROUND));
    const {secure_url,public_id}= await cloudinary.uploader.upload(req.file.path,{
        folder:`${process.env.APP_NAME}/users`
    })
     const token=jwt.sign({email},process.env.CONFIRMEMAILSECRET);
    await sendEmail(email,"confirm email",`<a href='${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}'>verify</a>`);
   
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
    if(!user.confirmEmail){
        return res.status(400).json({message:"plz confirm your email"});
    }

    const match =await bcrypt.compare(password,user.password);
    if(!match){
        return res.status(200).json({message:"success",user});

    }
    const token =jwt.sign({id:user._id,role:user.role,status:user.status},process.env.LOGINSECRET)//,{expiresIn:'5m'});//important fot security like Banks case
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
    return res.redirect(process.env.LOGINFRONTEND)
    
 }
}
export const sendCode=async(req,res)=>{
    const {email}=req.body;
    let code=customAlphabet('1234567890abcdzABCDZ',4);
    code=code();
    const user=await userModel.findOneAndUpdate({email},{sendCode:code},{new:true});
    const html=`<h2>code is :${code}</h2>`
    await sendEmail(email,`reset password`,html);
    return res.redirect(process.env.FORGETPASSWORDFORM);//redirecet to the  forume  for making new password
 //   return res.status(200).json({message:"success",user});
}
export const forgetPasseword=async(req,res)=>{
    const {email,password,code}=req.body;
    const user=await userModel.findOne({email});
    if(!user){
        return res.status(404).json({message:"not regrister account"})
    }
    if(user.sendCode!=code){
        return res.status(400).json({message:"invalid code"});
    }
    let match=await bcrypt.compare(password,user.password);
    if(match){
        return res.status(400).json({message:"same passsword"});
    }
    user.password=await bcrypt.hash(password,parseInt(process.env.SALT_ROUND));
    user.sendCode=null;
    user.changePasswordTime=Date.now();//to  log out from accounts that sign in with old password
    await user.save();
    return res.status(200).json({message:"success"})
}
export const deleteInvalidConfirm=async(req,res)=>{

    const users=await userModel.deleteMany({confirmEmail:false});
    return res.status(200).json({message:"success"});
}