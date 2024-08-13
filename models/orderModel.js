const mongoose = require('mongoose');
const Objectid = mongoose.Schema.Types.ObjectId;
const orderSchema = new mongoose.Schema(
    {
    userId:{
        type:Objectid,
        ref:"User",
        required:true,
    },
    deliveryAddress : {
        type: Objectid,
        required: true,
        ref: "Address",
    },
    payment : {
        type: String,
        required: true,
    },
    orderId :{
        type: Number,
        required: true,
    },
    orderAmount :{
        type: Number,
        required: true,
    },
    orderedItems : {
        type: Array,
        required: true,
    },
    paymentStatus:{
        type:String,
        required:true,
        default:'success'
    },
},
{
    timestamps: true,
}
);

const orderModel = mongoose.model("Order",orderSchema);
module.exports = orderModel;