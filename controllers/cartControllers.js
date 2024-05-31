const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

const addCart = async (req, res) => {
   // console.log('add to cart', req.body);
   try {
      const userId = req.session.user_id;
      const { productId, quantity, price, image, productName } = req.body;

      if (!userId) {
         return res.redirect('/');
      }

      const quantityNum = parseInt(quantity);
      const priceNum = parseInt(price);
      const total = priceNum * quantityNum;

          // Check if the product is already in the cart
    const existingCartItem = await Cart.findOne({ userId, productId });

    if (existingCartItem) {
      // Update the existing cart item
      existingCartItem.quantity += quantityNum;
      existingCartItem.total = existingCartItem.price * existingCartItem.quantity;
      await existingCartItem.save();
    } else {
      const newCart = new Cart({
         productId,
         userId,
         quantity: quantityNum,
         price: priceNum,
         total,
         image,
         productName,

      });
      await newCart.save();
   }
      res.status(201).json({ success: true });
   } catch (error) {
      console.log(error.message);
      res.status(500).json('error');
   }
}

const loadCart = async (req, res) => {
   try {
      const userId = req.session.user_id;
      const cartData = await Cart.find({ userId });
      res.render('cart', { cartData:cartData });
   } catch (error) {
      console.log(error.message);
   }
}

const updateCart = async (req,res) => {
   try {
      console.log('hiiiiiii')
      res.redirect('/cart');
   } catch (error) {
      console.log(error.message);
      res.status(500).json('error');
   }
}

const removeCartItem = async (req, res) => {
   try {

      // console.log('remove work aavnd ')
      const cartId = req.params.id
      await Cart.deleteOne({ _id: cartId });
      res.redirect('/cart')
      // console.log('deleted successfully')

   } catch (error) {
      console.log(error.message);
      res.status(500).json('error')
   }
}

const quantityIncrease = async (req,res) =>{
   try {
      const id = req.params.id;
      // console.log(id,'iiiiii');
      await Cart.findOneAndUpdate({_id:id},{$inc:{quantity:1}});
      res.redirect('/cart');
   } catch (error) {
      console.log(error.message);
      json.message('error')
   }
}

const quantityDecrease = async (req,res) =>{
   try {
      const id = req.params.id;
      await Cart.findOneAndUpdate({_id:id},{$inc:{quantity:-1}});
      res.redirect('/cart');
   } catch (error) {
      console.log(error.message);
   }
}

module.exports = {
   addCart,
   loadCart,
   removeCartItem,
   quantityIncrease,
   updateCart,
   quantityDecrease,
   
}