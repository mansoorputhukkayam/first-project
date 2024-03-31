const express = require('express');
const userRouter = express.Router();

const passport = require('passport');

const bodyParser = require('body-parser');
const {isLogin,isLogout,isBlocked} = require('../middleware/auth')
const user = require('../models/userModel');

userRouter.use(bodyParser.json());
userRouter.use(bodyParser.urlencoded({ extended: true }));

const userController = require('../controllers/userController');
userRouter.get('/',userController.loadHome);
userRouter.get('/login',isLogout,userController.loginLoad);
userRouter.get('/shop',userController.loadShop)
userRouter.get('/signin',isLogout,isBlocked,userController.loadSignin)
userRouter.get('/about',isBlocked,userController.loadAbout);
userRouter.get('/product',isLogin,isBlocked,userController.loadProduct);
userRouter.get('/services',isBlocked,userController.loadServices);
userRouter.get('/blog',isBlocked,userController.loadBlog);
userRouter.get('/contact',isBlocked,userController.loadContact);
userRouter.get('/cart',isLogin,isBlocked,userController.loadCart);
userRouter.get('/user',isLogin,userController.loadProfile);
userRouter.get('/logout',userController.loadLogout);
// userRouter.get('/login/federated/google', passport.authenticate('google'));


userRouter.post('/login',isBlocked,userController.verifyLogin);
userRouter.post('/signin',userController.insertUser);  
userRouter.post('/verify',userController.verifyMail);

module.exports = userRouter;