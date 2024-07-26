const mongoose = require('mongoose');

let walletSchema = new mongoose.Schema({

    balance:{
        type:Number,
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users'
    },
    history:[
        {
            Date:{
                type:String,
                required:true
            },
            Description:{
                type:String,
                required:true
            },
            Amount:{
                type:Number,
                required:true
            },
            time:{
                type:Date,
                required:true
            }
        }
    ]
})

module.exports = mongoose.model('Wallet',walletSchema);