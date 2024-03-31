const mongoose = require('mongoose');
// const ObjectId = mongoose.Schema.Types.ObjectId
const categorySchema =new mongoose.Schema({
    categoryName: {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    status : {
        type : Boolean,
        default : true
    },
    is_blocked:{
        type:Boolean,
        default:false
    }
});

module.exports = mongoose.model('Category',categorySchema);