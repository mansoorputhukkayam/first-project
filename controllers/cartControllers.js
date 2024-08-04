const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Address = require('../models/addressModel');
const Order = require('../models/orderModel');
const categoryModel = require('../models/categoryModel');
const Razorpay = require('razorpay');
const wishlistModel = require('../models/wishlistModel');
const Coupon = require('../models/couponModel');
const Wallet = require('../models/walletModel');

let instance = new Razorpay({
   key_id: 'rzp_test_4AB1dm0KvAE5MR',
   key_secret: '8EUhYfAmGN3B5Grn0fGrnUGa'
});


const addCart = async (req, res) => {
   // console.log('add to cart', req.body);
   try {
      const userId = req.session.user_id;
      const { productId, quantity, price, image, productName } = req.body;
      console.log(req.body,'req.body');

      if (!userId) {
         return res.redirect('/');
      }

      if(!productId || !productName || !image || !price || !quantity){
         return res.status(400).json({error:'All fields are required.'});
      }

      const quantityNum = parseInt(quantity);
      const priceNum = parseInt(price);

      if(isNaN(quantityNum) || isNaN(priceNum)){
         return res.status(400).json({error:"Quantity and price must be valid numbers"});
      }
      const total = priceNum * quantityNum;

      // Check if the product is already in the cart
      const existingCartItem = await Cart.findOne({ userId, productId });

      if (existingCartItem) {
         req.flash('msg', 'item already added');
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
      const cartData = await Cart.find({ userId }).sort({_id:-1}).populate('couponDiscount').exec();
      const cartTotal = cartData.reduce((total, cart) => total + cart.total, 0);
      const couponData = await Coupon.find({});
      const couponDiscountAmount = req.session.couponAmount;
      // console.log('cccc',couponDiscountAmount);
      res.render('cart', { cartData: cartData, cartTotal, couponData, couponDiscountAmount });
   } catch (error) {
      console.log(error.message);
   }
}

const checkCart = async (req, res) => {
   try {
      const { productId } = req.body;
      const userId = req.session.user_id; // Assuming you are storing user ID in session

      // Check if the product is already in the cart
      const cartItem = await Cart.findOne({ productId: productId, userId: userId });
      console.log('cartItem',cartItem);

      if (cartItem) {
         res.json({ exists: true });
      } else {
         res.json({ exists: false });
      }
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
};

const updateCart = async (req, res) => {
   try {
      const userId = req.session.user_id;
      const userData = await Cart.findOne({ userId: userId });
      const productData = userData.productId;

      const total = userData.price * userData.quantity;
      console.log(total, '<<<<<<<<<<<total>>>>>>>>>>>>>>');
      // const total = quantity * total ; 
      // console.log(total,'<<<<<<<<<<<total>>>>>>>>>>>>>>');
      const updatedCart = await Cart.findByIdAndUpdate(userData._id, { total })
      // console.log(userId,'<<<<<<<<<<user>>>>>>>>>>')

      res.redirect('/cart');
   } catch (error) {
      console.log(error.message);
      res.status(500).json('error');
   }
}

const removeCartItem = async (req, res) => {
   try {
      console.log('remove work aavnd ')
      const cartId = req.params.id;
      await Cart.deleteOne({ _id: cartId });
      res.redirect('/cart')
      // console.log('deleted successfully')

   } catch (error) {
      console.log(error.message);
      res.status(500).json('error')
   }
}

const quantityIncrease = async (req, res) => {
   try {
      const cartItemId = req.params.id;
      // console.log(id,'iiiiii');
      console.log('incresssee....')
      const updatedCartItem = await increaseCartItemQuantity(cartItemId);
      res.json(updatedCartItem);
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
}

const increaseCartItemQuantity = async (cartItemId) => {
   let cartItem = await Cart.findById(cartItemId);
   let cartProductName = cartItem.productName;
   // console.log(cartProductName,'cartIddd');
   const product = await Product.findOne({ name: cartProductName });
   const productCount = product.quantity;

   // const productCount = product['na];
   // console.log('productcount',productCount);
   // console.log('cart', cartItem)
   if (!cartItem) {
      throw new Error('Cart item not found');
   }
   if (cartItem.quantity < productCount) {

      if (cartItem.quantity < 7) {
         cartItem.quantity += 1;
      } else {
         throw new Error('maximum quantity reached');
      }
   }

   cartItem.total = cartItem.quantity * cartItem.price;
   await cartItem.save();

   return cartItem;
};

const quantityDecrease = async (req, res) => {
   try {
      const cartItemId = req.params.id;
      console.log('dddcresseee....');
      const updatedCartItem = await decreaseCartItemQuantity(cartItemId);
      res.json(updatedCartItem);
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
}

const decreaseCartItemQuantity = async (cartItemId) => {
   // Find the cart item by its ID
   let cartItem = await Cart.findById(cartItemId);
   if (!cartItem) {
      throw new Error('Cart item not found');
   }

   // Ensure the quantity never goes below 1
   if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
   } else {
      throw new Error('Quantity cannot be less than 1');
   }

   // Update the total price
   cartItem.total = cartItem.quantity * cartItem.price;

   // Save the updated cart item back to the database
   await cartItem.save();

   return cartItem;
};

const loadCheckout = async (req, res) => {
   try {
      const userId = req.session.user_id;
      // console.log('session',userId)
      const userCartData = await Cart.find({ userId });
      // console.log('usercardDAta',userCartData)
      const addressData = await Address.find({ userId });
      console.log('addressData', addressData)
      const userCartTotal = userCartData.reduce((total, cart) => total + cart.total, 0);
      // console.log('usercartTotal',userCartTotal)
      res.render('checkout', { userCartData: userCartData, userCartTotal, addressData });
   } catch (error) {
      console.log(error.message)
   }
}

const postCheckOut = async (req, res) => {
   try {
      console.log('eddd')
      // console.log(req.body,'req.body')
      const userId = req.session.user_id;
      const userData = await User.findOne({ _id: userId });
      const userDataId = userData._id;
      let cartData = await Cart.find({ userId });
      const paymentMethod = req.body.paymentMethod;
      console.log('paymetnt', paymentMethod);
      const deliveryAddress = await Address.findOne({ name: req.body.name });
      console.log('delivery addres', deliveryAddress);
      const deliveryAddressId = deliveryAddress._id;

      const orderStatus = req.body.paymentMethod === 'COD' ? 'Placed' : 'Pending';
      console.log('order Staus ', orderStatus);
      console.log('deliveryaddId', deliveryAddressId);
      const randomInteger = Math.floor(Math.random() * 100000000000);
      console.log('orderId', randomInteger);
      let totalAmount = 0;
      cartData.forEach((i) => (totalAmount += i.total));

      cartData = cartData.map((item) => {
         return { ...item._doc, status: orderStatus };
      });


      const orderData = new Order({
         userId: userDataId,
         deliveryAddress: deliveryAddressId,
         payment: paymentMethod,
         orderId: randomInteger,
         orderAmount: totalAmount,
         status: orderStatus,
         orderedItems: cartData,
      });

      const orderDetails = await orderData.save();
      console.log(orderDetails, 'orderDetails');
      const orderid = orderDetails._id;
      console.log('orderid', orderid);

      if (orderStatus == 'Placed') {

         res.status(200).json({ codSuccess: true, orderid });

      } else if (paymentMethod == 'Razorpay') {

         const options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: orderid,
         };

         instance.orders.create(options, (err, order) => {
            if (err) {
               console.log('error:', err);
            }
            console.log('new order:', order);
            res.status(200).json({ onlineSuccess: true, order })
         })

      }

      // res.redirect('/thankyou');

   } catch (error) {
      console.log(error.message);

   }
}

const verifyPayment = async (req, res) => {
   try {
      console.log('verifyPayment page loaded');
      res.status(200).json({ Success: true })

   } catch (err) {
      console.log(err);
   }
}

const thankyou = async (req, res) => {
   try {
      console.log('hello');
      // console.log(req.body)
      const userId = req.session.user_id;
      const lastOrder = await Order.findOne({}).sort({ _id: -1 });
      for (let item of lastOrder.orderedItems) {
         await Product.updateOne({ _id: item.productId }, { $inc: { quantity: -item.quantity } })
         // console.log('item-id',item.quantity)
      }
      const productDetails = lastOrder.orderedItems;
      const productId = productDetails.map(product => product.productId);
      const prdct = await Product.find({ _id: productId }).populate('categoryId');
      // console.log(prdct,'prdcttt')

      const del = await Cart.deleteMany({ userId });
      console.log('succes...', del);


      res.render('thankyou', { lastOrder, prdct });
   } catch (error) {
      console.log(error.message);
   }
}



// const loadWishlist = async(req,res) =>{
//    try {
//       console.log('load wishlisgh');
//       const userId = req.session.user_id;
//       const cartData = await Cart.find({ userId });
//       const cartTotal = cartData.reduce((total, cart) => total + cart.total, 0);
//       // console.log('cartTotal',cartTotal)  

//       res.render('wishlist',{cartData:cartData,cartTotal});
//    } catch (error) {
//       console.log(error.message);
//    }
// }


module.exports = {
   addCart,
   // loadWishlist,
   loadCart,
   removeCartItem,
   quantityIncrease,
   updateCart,
   quantityDecrease,
   loadCheckout,
   postCheckOut,
   checkCart,
   thankyou,
   verifyPayment,
}