const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Address = require('../models/addressModel');
const Order = require('../models/orderModel');
const categoryModel = require('../models/categoryModel');

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
      const cartData = await Cart.find({ userId });
      const cartTotal = cartData.reduce((total,cart)=>total + cart.total,0);
      // console.log('cartTotal',cartTotal)
      res.render('cart', { cartData: cartData ,cartTotal});
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
   console.log('cart', cartItem)
   if (!cartItem) {
      throw new Error('Cart item not found');
   }

   cartItem.quantity += 1;
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

const checkOut = async (req,res)=>{
   try {
      // console.log('eddd')
      // console.log(req.body);
      const userId = req.session.user_id;
      const userData = await User.findOne({_id:userId});
      const userDataId = userData._id;
      let cartData = await Cart.find({userId});
      const paymentMethod = req.body.paymentMethod;
      const deliveryAddress = await Address.findOne({name:req.body.name}); 
      const deliveryAddressId = deliveryAddress._id;
      const randomInteger = Math.floor(Math.random() * 100000000000 );
      let totalAmount = 0;
      cartData.forEach((i)=>(totalAmount += i.total));
      
      // console.log(userId,'userId');
      // console.log(cartData,'cartData');
      // console.log(paymentMethod,'paymentMentheod');
      // console.log(randomInteger,'randomInteree');
      // console.log(totalAmount,'totalamint');
      
      const orderData = new Order({
         userId:userDataId,
         deliveryAddress:deliveryAddressId,
         payment:paymentMethod,
         orderId:randomInteger,
         orderAmount:totalAmount,
         orderedItems:[...cartData],
      });
      await orderData.save();
      const del = await Cart.deleteMany({userId});
      console.log('succes...',del);
      res.redirect('/thankyou');

   } catch (error) {
    console.log(error.message);  
   }
}

const thankyou = async (req,res)=>{
   try {
      console.log('hello');
      // console.log(req.body)
      const lastOrder = await Order.findOne({}).sort({_id: -1});
      const productDetails = lastOrder.orderedItems;
      const productId = productDetails.map(product=>product.productId);
      const prdct = await Product.find({_id:productId}).populate('categoryId');
      console.log(prdct,'prdcttt')
      res.render('thankyou',{lastOrder,prdct});
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
   checkCart,
   checkOut,
   thankyou,
}