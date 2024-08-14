const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        min: 0,
        required: true
    },
    orgPrice:{
        type:Number
    },
    image: {
        type: [String],
        required: true
    },
    categoryId: {
        type: ObjectId,
        ref: 'Category',
        required: true
    },
    quantity: {
        type: Number,
        min: 0,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["active", "blocked"],
        default: "active"
    },
    croppedImageData: {
        type: {
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 },
            width: { type: Number, default: 0 },
            height: { type: Number, default: 0 }
        }
    },
    is_Unlisted: {
        type: Boolean,
        default: false
    },
    salesCount: {
        type: Number,
        default: 0
    },

    productOfferId: {
        type: ObjectId,
        ref: 'Offer'
    },
    categoryOfferId: {
        type: ObjectId,
        ref: 'Offer'
    },
    productDiscount: {
        type: Number,
    },
    categoryDiscount: {
        type: Number
    }
});

module.exports = mongoose.model('Product', productSchema);