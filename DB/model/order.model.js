import mongoose,{Schema,model,Types} from 'mongoose'
const orderSchema=new Schema({
   userId:{
    type:Types.ObjectId,ref:'User',required:true,
   },
   products:[{
   productId:{type:Types.ObjectId,ref:'Product',required:true},
   quantity:{type:Number,default:1,required:true},
   unitPrice:{type:Number,required:true},
   finalPrice:{}
   }],
   finalPrice:{
    type:Number,required:true
   },
   address:{type:String,required:true},
   phoneNumber:{type:String,required:true},
   couponId:{
    type:Number,
    required:true,
   },
   paymentType:{
    type:String,
    default:'cash',
    enum:['cart','cash'],
   },
    status:{
        type:String,
        default:'pending',
        enum:['pending','cancelled','confirmed','onWay','deliverd'],
    },
  reasonRejected:String,
  note:String,
   updatedBy:{type:Types.ObjectId,ref:'User',required:true},
},
{
    timestamps:true,

});


const orderModel=mongoose.models.Order||model('Order',orderSchema);
export default orderModel;