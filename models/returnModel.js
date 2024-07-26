const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({

    orderId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    reason:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('returnProduct',returnSchema);