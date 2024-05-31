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
userRouter.get('/login',isLogout,userController.loginLoad);
userRouter.get('/shop',userController.loadShop)
userRouter.get('/signin',isLogout,isBlocked,userController.loadSignin)
userRouter.get('/about',isBlocked,userController.loadAbout);
userRouter.get('/product',isLogin,isBlocked,userController.loadProduct);
userRouter.get('/services',isBlocked,userController.loadServices);
userRouter.get('/blog',isBlocked,userController.loadBlog);
userRouter.get('/contact',isBlocked,userController.loadContact);
userRouter.get('/shop/:id',userController.loadShop);
userRouter.get('/forgotPassword',userController.forgotPassword);
userRouter.post('/search',userController.loadShop);

//filtering of products 
userRouter.get('/loadpricehigh',productController.lowHigh);
userRouter.get('/loadpricelow',productController.highLow);
userRouter.get('/nameAscending',productController.nameAscending);
userRouter.get('/nameDescending',productController.nameDescending);

// userRouter.get('/cart',isLogin,isBlocked,userController.loadCart);
userRouter.get('/user',isLogin,userController.loadProfile);
// userRouter.get('/logout',userController.loadLogout);
userRouter.get('/cart',cartControllers.loadCart);
userRouter.get('/removeCartItem/:id',cartControllers.removeCartItem);
userRouter.get('/loadCheckout',userController.loadCheckout);
userRouter.get('/deleteAddress/:id',addressController.deleteAddress);
userRouter.get('/quantityIncrease/:id',cartControllers.quantityIncrease);
userRouter.get('/quantityDecrease/:id',cartControllers.quantityDecrease);
userRouter.get('/updateCart',cartControllers.updateCart);
// userRouter.get('/devideByCategorise',productController.devidebyCategorise);

// userRouter.get('/login/federated/google', passport.authenticate('google'));
// userRouter.post('/update-cart-quantity',cartControllers.updateQuantity);
userRouter.post('/addAddress',addressController.addAddress);
userRouter.post('/updateAddress',addressController.updateAddress);
userRouter.post('/updateProfile',userController.updateProfile);
userRouter.post('/changeUserPassword',userController.changeUserPassword);
userRouter.post('/addToCart', cartControllers.addCart);
userRouter.post('/login',isBlocked,userController.verifyLogin);
userRouter.post('/signin',userController.insertUser);  
userRouter.post('/verify',userController.verifyMail);
userRouter.post('/logout',userController.loadLogout);
userRouter.post('/forgotPassword',userController.updateForgotPassword);
userRouter.post('/verifyForgotPassword',userController.verifyForgotPassword);
userRouter.post('/updateForgotPassword',userController.updateForgotNewPassword);


module.exports = userRouter;