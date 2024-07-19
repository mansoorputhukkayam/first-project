const Product = require('../models/productModel');
const Wishlist = require('../models/wishlistModel');

const viewWishlist = async(req,res) =>{
    try {
        console.log('view wishlist');
        const userId = req.session.user_id;
        const wishlist = await Wishlist.find({userId : userId}).populate({
            path:'products.productsId',
            model:'Product'
        });
        console.log(wishlist);
        res.render('wishlist',{wishlist});
    } catch (error) {
        console.log('its an error ',error);
    }
}

const addToWishlist = async(req,res)=>{
    try {
        console.log('addto wishlist');
        let productId = req.params.id;
        const userId = req.session.user_id;
        let wishlistItem = await Wishlist.find({userId:userId});
        const existing = await Wishlist.find({
            userId:userId,
            products:{$elemMatch:{productId : productId}}
        });
        if(wishlistItem.length > 0){
            if(existing.length == 0){
                let update = await Wishlist.updateOne(
                    {userId:userId},
                    {$addToSet:{products:{productId:productId}}}
                );
            }else{
                let wishlist = new Wishlist({
                    userId:userId,
                    products :[{productId:productId}]
                })
                let saveWishlist = await wishlist.save();
            }
        }
    } catch (error) {
        console.log('error adding to item',error);
    }
}

const removeWishlist = async(req,res) =>{
    try {
       const productId = req.params.id;
       await Wishlist.updateOne(
        {'products._id':productId},
        {$pull:{products:{_id:productId}}}
       );
       const removed = true;
       res.json({removed}); 
    } catch (error) {
        console.log('error for removing item',error);
    }
}

module.exports = {
    viewWishlist,
    addToWishlist,
    removeWishlist,
}