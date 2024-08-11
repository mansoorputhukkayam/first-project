const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const cartSchema = new mongoose.Schema({
    productId:{
        type:ObjectId,
        ref:'Product'
    },
    userId:{
        type:ObjectId,
        ref:'User'
    },
    quantity:{
        type:Number,
    },
    price:{
        type:Number,
    },
    total:{
        type:Number,
    },
    image:{
        type:String,
    },
    productName:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        default:'pending',
    },
    couponDiscount:{
        type:ObjectId,
        ref:'Coupon',
        default:null
    }
});


module.exports = mongoose.model('Cart',cartSchema);