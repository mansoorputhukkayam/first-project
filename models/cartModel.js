const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const cartSchema = new mongoose.Schema({
    productId:{
        type:ObjectId,
        ref:'Products'
    },
    userId:{
        type:ObjectId,
        ref:'Users'
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
    isOrder:{
        type:Boolean,
        default:false,
    }
});


module.exports = mongoose.model('Cart',cartSchema);