const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId
const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        min:0,
        required:true
    },
    image:{
       type:[String],
       required:true 
    },
    categoryId:{
        type:ObjectId,
        ref:'Category',
        required:true
    },
    quantity:{
        type:Number,
        min:0,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:["active","blocked"],
        default:"active"
    },
    croppedImageData:{
        type:{
            x:{type:Number,default:0},
            y:{type:Number,default:0},
            width:{type:Number,default:0},
            height:{type:Number,default:0}
        }
    },
    is_Unlisted:{
        type:Boolean,
        default:false
    }
});

module.exports = mongoose.model('Product',productSchema);