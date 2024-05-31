const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const addressSchema = new mongoose.Schema({
    userId:{
        type:ObjectId,
        ref:'Users'
    },
    name:{
        type:String,
    },
    mobile:{
        type:Number,
    },
    pincode:{
        type:Number,
    },
    address:{
        type:String,
    },
    locality:{
        type:String,
    },
    post:{
        type:String,
    },
    state:{
        type:String,

    },
    district:{
        type:String,
    }

})

module.exports = mongoose.model('Address',addressSchema);
