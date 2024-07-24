const mongoose = require('mongoose');
const offerSchema = new mongoose.Schema({
    offerName:{
        type:String,
        required:true
    },
    discountPercentage:{
        type:Number,
        required:true
    },
    offerType:{
        type:String,
        required:true
    },
    expiryDate:{
        type:Date,
        required:true
    },
    category:{
        type:String,
        ref:'Category'
    },
    product:{
        type:String,
        ref:'Product'
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{
    timestamps:true
});

module.exports = mongoose.model('Offer',offerSchema);