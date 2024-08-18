const Product = require('../models/productModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');

const loadWishlist = async (req, res) => {
    try {
        console.log('view wishlist');
        const userId = req.session.user_id;
        const wishlist = await Wishlist.find({ userId: userId }).populate({
            path: 'products.productId',
            model: 'Product'
        });

        let productCount = 0;
        wishlist.forEach(item => {
            productCount += item.products.length;
        });

        const cartData = await Cart.find({ userId: userId });
        // const itemsCount = cartData?.product.length;
        console.log(wishlist);
        res.render('wishlist', { wishlist, userId ,productCount});
    } catch (error) {
        console.log('its an error ', error);
        res.status(500).render('Error-500');
    }
}

const checkWishlist = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const productId = req.body.productId;

        const existingProduct = await Wishlist.findOne({
            userId: userId,
            'products.productId': productId
        });

        if (existingProduct) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }

    } catch (error) {
        console.log('Error checking wishlist', error);
        res.status(500).render('Error-500');
    }
}

const addToWishlist = async (req, res) => {
    try {
        console.log('addto wishlist');
        const userId = req.session.user_id;
        const { productId, productName, image, price, quantity } = req.body;


        let wishlist = await Wishlist.findOne({ userId: userId });

        if (wishlist) {
            const existingProduct = wishlist.products.find(product => product.productId == productId);
            if (!existingProduct) {
                wishlist.products.push({ productId, productName, image, price, quantity });
                await wishlist.save();
                res.json({ success: true });
            } else {
                res.json({ success: false, message: 'Product already exists in wishlist' });
            }
        } else {
            const newWishlist = new Wishlist({
                userId: userId,
                products: [{ productId, productName, image, price, quantity }]
            });
            await newWishlist.save();
            res.json({ success: true });
        }

    } catch (error) {
        console.log('error adding to wishlist', error);
        res.status(500).render('Error-500');
    }
};

const removeWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        console.log('rrrrmove', productId);

        await Wishlist.updateOne(
            { 'products._id': productId },
            { $pull: { products: { _id: productId } } }
        );
        res.json({ removed: true });
    } catch (error) {
        console.log('error for removing item', error);
        res.status(500).render('Error-500');
    }
}


module.exports = {
    loadWishlist,
    addToWishlist,
    removeWishlist,
    checkWishlist,
}