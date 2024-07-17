const express = require('express');
const userRouter = express.Router();

const passport = require('passport');
const Cart = require('../models/cartModel');

const bodyParser = require('body-parser');
const {isLogin,isLogout,isBlocked} = require('../middleware/auth')
const user = require('../models/userModel');

userRouter.use(bodyParser.json());
userRouter.use(bodyParser.urlencoded({ extended: true }));

const cartControllers = require('../controllers/cartControllers');
const productController = require('../controllers/productController');
const userController = require('../controllers/userController');
const addressController = require('../controllers/addressController');
userRouter.get('/',userController.loadHome);
userRouter.get('/login',userController.loginLoad);
userRouter.get('/shop',userController.loadShop)
userRouter.get('/signin',isBlocked,userController.loadSignin)
userRouter.get('/about',isLogin,isBlocked,userController.loadAbout);
userRouter.get('/product',isLogin,isBlocked,productController.loadProducts);
userRouter.get('/services',isLogin,isBlocked,userController.loadServices);
userRouter.get('/blog',isLogin,isBlocked,userController.loadBlog);
userRouter.get('/contact',isLogin,isBlocked,userController.loadContact);
userRouter.get('/shop/:id',isLogin,isBlocked,userController.loadShop);
userRouter.get('/forgotPassword',userController.forgotPassword);
userRouter.post('/search',userController.loadSearch);

//filtering of products 
userRouter.get('/loadpricehigh',isLogin,isBlocked,productController.lowHigh);
userRouter.get('/loadpricelow',isLogin,isBlocked,productController.highLow);
userRouter.get('/nameAscending',isLogin,isBlocked,productController.nameAscending);
userRouter.get('/nameDescending',isLogin,isBlocked,productController.nameDescending);

userRouter.get('/user',isLogin,userController.loadProfile);
// userRouter.get('/logout',userController.loadLogout);
userRouter.get('/cart',isLogin,isBlocked,cartControllers.loadCart);
userRouter.get('/removeCartItem/:id',isLogin,isBlocked,cartControllers.removeCartItem);
userRouter.get('/loadCheckout',isLogin,isBlocked,cartControllers.loadCheckout);
userRouter.get('/deleteAddress/:id',isLogin,isBlocked,addressController.deleteAddress);
userRouter.get('/quantityIncrease/:id',isLogin,isBlocked,cartControllers.quantityIncrease);
userRouter.get('/quantityDecrease/:id',isLogin,isBlocked,cartControllers.quantityDecrease);
userRouter.get('/updateCart',isLogin,isBlocked,cartControllers.updateCart);
userRouter.get('/thankyou',isLogin,isBlocked,cartControllers.thankyou);
userRouter.get('/userbtn',isLogin,isBlocked,userController.cancelProducts);
// userRouter.get('/devideByCategorise',productController.devidebyCategorise);

// userRouter.get('/login/federated/google', passport.authenticate('google'));
// userRouter.post('/update-cart-quantity',cartControllers.updateQuantity);
userRouter.post('/addAddress',addressController.addAddress);
userRouter.post('/checkOutAddAddress',addressController.checkOutAddAddress);
userRouter.post('/updateAddress',addressController.updateAddress);
userRouter.post('/updateProfile',userController.updateProfile);
userRouter.post('/changeUserPassword',userController.changeUserPassword);
userRouter.post('/addToCart', cartControllers.addCart);
userRouter.post('/checkCart',cartControllers.checkCart);
userRouter.post('/checkOut',cartControllers.postCheckOut);
userRouter.post('/login',isBlocked,userController.verifyLogin);
userRouter.post('/signin',userController.insertUser);  
userRouter.post('/verify',userController.verifyMail);
userRouter.post('/logout',userController.loadLogout);
userRouter.post('/forgotPassword',userController.updateForgotPassword);
userRouter.post('/verifyForgotPassword',userController.verifyForgotPassword);
userRouter.post('/updateForgotPassword',userController.updateForgotNewPassword);


module.exports = userRouter;