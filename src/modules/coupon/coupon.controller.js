import couponModel from "../../../DB/model/coupon.model.js";

export const createCoupon=async(req,res)=>{
try{
    const {name}=req.body;
    if(await couponModel.findOne({name})){
        return res.status(409).json({message:"coupon name already exists"});
    }
    const coupon=await couponModel.create(req.body);
    return res.status(201).json({message:"success",coupon});
    
}catch(err){return res.json(err)}
   }
export const getCoupons=async(req,res)=>{
const coupons=await couponModel.find({isDeleated:false});
return res.status(200).json({message:"success",coupons});
}

export const updateCoupon=async(req,res)=>{
const coupon=await couponModel.findById(req.params.id);
if(!coupon){
    return res.status(404).json({message:"coupon not found"});
}
if(req.body.name){
    if(await couponModel.findOne({name:req.body.name}).select('name')){
        return res.status(409).json({message:`coupon ${req.body.name} already exists`})
    }
    coupon.name=req.body.name;
}
if(req.body.amount){
    coupon.amount=req.body.amount;
}
await coupon.save();
return res.status(200).json({message:"success",coupon});
}
export const softDelete=async(req,res)=>{
    const{id}=req.params;
    const coupon=await couponModel.findByIdAndUpdate({_id:id,isDeleated:false},{isDeleated:true},{new:true});
    if(!coupon){
        return res.status(400).json({message:"can't delete this coupon"})
    }
    return res.status(200).json({message:"success"});

}
export const hardDelete=async(req,res)=>{
const {id}=req.params;
const coupon =await couponModel.findOneAndDelete({_id:id});
if(!coupon){
    return res.status(400).json({message:"can't delete this coupon"})
}
return res.status(200).json({message:"success"});
}
export const restore=async(req,res)=>{
    const {id}=req.params;
    const coupon =await couponModel.findOneAndUpdate({_id:id,isDeleated:true},{isDeleated:false},{new:true});
    if(!coupon){
        return res.status(400).json({message:"can't restore this coupon"})
    }
    return res.status(200).json({message:"success"});
}