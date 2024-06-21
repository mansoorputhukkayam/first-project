
const Address = require('../models/addressModel');

const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const OTP = require('../models/signUpOtp')
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Category = require('../models/categoryModel')
const Order = require('../models/orderModel');
const mongoose = require('mongoose');

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
const securePassword = async (password) => {
    try {
        const passwordHash = bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

const sendVerifyMail = async (name, email, user_id, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'mansoorputhukkayam@gmail.com',
                pass: 'vbss bhpb juzr mkwi'
            }
        });
        const mailOptions = {
            from: 'mansoorputhukkayam@gmail.com',
            to: email,
            subject: 'For OTP Verification ',
            text: `Your OTP (One-Time-Password) for Verificaton is: ${otp}`
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log("Email has been sent: -", info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

const loginLoad = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}

const loadSignin = async (req, res) => {
    try {
        res.render('signin');
    } catch (error) {
        console.log(error.message);
    }
}
const loadOtp = async (req, res) => {
    try {
        res.render('signupotp')
    } catch (error) {
        console.log(error.message);
    }
}
const insertUser = async (req, res) => {
    try {

        const spassword = await securePassword(req.body.password);

        // res.locals.formData = {
        //     name: req.body.name,
        //     email: req.body.email,
        //     mobile: req.body.mobile,
        //     password: req.body.password,
        // };

        // console.log(res.locals.formData);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: spassword,
            is_admin: 0
        });
        const userData = await user.save();
        if (userData) {
            const otp = generateOTP();
            saveOTP(req.body.email, otp)
            sendVerifyMail(req.body.name, req.body.email, userData._id, otp);
            console.log('jjjjj', otp);
            req.session.user_id = userData._id;
            res.render('signupotp')
        }
        else {
            res.render('signin', { message: 'your registration is failed...' })
        }
    }
    catch (error) {
        console.log(error.message);
    }
}

// const verifyMail = async(req,res)=>{
//     try{
//         // console.log(res.locals.formData)
//         // console.log(a);
//         const enteredOtp = req.body.otp;
//         console.log('hhhh',enteredOtp)
//         const userOtp = await OTP.findOne({otp:enteredOtp});
//         console.log('kituo',userOtp.otp);
//         if (!userOtp) {
//             // Handle the case where no OTP was found
//             return res.render('signupotp', { message: "OTP is incorrect..." });
//         } 
//             if(enteredOtp === userOtp.otp){
//                 res.render('home')
//             }
//             else{
//                 res.send('Invalid OTP');
//             }

//         else{
//             res.render('signupotp', { message: "Password  is incorrect..." });
//         }
//     }

//     } catch (error) {
//         console.log(error.message);    
//     }

const verifyMail = async (req, res) => {
    try {
        const enteredOtp = req.body.otp;
        console.log('hhhh', enteredOtp);

        const userOtp = await OTP.findOne({ otp: enteredOtp });

        if (!userOtp) return res.render('signupotp', { message: "OTP is incorrect...!!" });
        else res.render('home');

    } catch (error) {
        console.error(error);
        // Optionally, send a generic error message to the client
        res.status(500).send('An error occurred while verifying the OTP.');
    }
};






// Example usage of the OTP model
const saveOTP = async (email, otp) => {
    try {
        // Create a new OTP document and save it to the database
        const newOTP = new OTP({
            email: email,
            otp: otp
        });
        const otpData = await newOTP.save();
        console.log('OTP saved to database:', otpData);
    } catch (error) {
        console.error('Error saving OTP to database:', error);
    }
};
const loadHome = async (req, res) => {
    try {
        res.render('home');
    } catch (error) {
        console.log(error.message);
    }
}

const loadProfile = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const userProfile = await User.findById(userId);
        const viewAddress = await Address.find({ userId });
        const orderData = await Order.find({ userId }).populate('deliveryAddress').exec();
        // console.log('order',orderData,'order');
        res.render('user', { userProfile: userProfile, viewAddress, orderData });
    } catch (error) {
        console.log(error.message);
    }
}

const updateProfile = async (req, res) => {
    try {
        const userId = req.body.id;
        const { name, mobile, email } = req.body;
        const updateProfile = await User.findByIdAndUpdate(userId, { name, mobile, email }, { new: true });
        res.redirect('/user');
    } catch (error) {
        console.log(error.message);
        res.json('error');
    }
}

const verifyLogin = async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_blocked === false) {
                    req.session.user_id = userData._id;
                    res.redirect('/');
                }
                else {
                    res.render('login', { message: "You are blocked by Admin..." });
                }

            }
            else {

                res.render('login', { al: "Password  is incorrect..." });
            }

        }
        else {
            res.render('login', { message: "User not found.." });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadAbout = async (req, res) => {
    try {
        res.render('about');
    }
    catch (error) {
        console.log(error.message)
    }
}

const loadServices = async (req, res) => {
    try {
        res.render('services')
    } catch (error) {
        console.log(error.message);
    }
}

const loadBlog = async (req, res) => {
    try {
        res.render('blog');
    } catch (error) {
        console.log(error.message);
    }
}

const loadContact = async (req, res) => {
    try {
        res.render('contact');
    } catch (error) {
        console.log(error.message);
    }
}

const loadLogout = async (req, res) => {
    try {
        req.session.user_id = null;
        res.status(200).send({ message: 'Sign out Successfully...' });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: 'Error signout' });
    }
}

// const updateCart = async (req, res) => {
//     try {
//         const productId = req.body.productId;
//         // Logic to add the product to the cart
//         // This could involve adding the product to a session or a database
//         // For simplicity, let's assume you're using session to store cart items
//         if (!req.session.cart) {
//             req.session.cart = [];
//         }
//         req.session.cart.push(productId);

//         // Redirect to the cart page
//         res.redirect('/cart');
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server error!!!!');
//     }
// }

const loadCheckout = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const userCartData = await Cart.find({ userId });
        const addressData = await Address.find({ userId });
        const userCartTotal = userCartData.reduce((total, cart) => total + cart.total, 0);
        res.render('checkout', { userCartData: userCartData, userCartTotal, addressData });
    } catch (error) {
        console.log(error.message)
    }
}

// adminDashboard = async(req,res)=>{
//     try {
//         var search = '';
//         if(req.query.search){
//             search = req.query.search;
//         }
//         const searchRegex = new RegExp('.*'+search+'.*','i');
//         const userData = await User.find({
//             is_admin:0,
//             $or:[
//                 { name: searchRegex },
//                 { email: searchRegex },
//                 { mobile: searchRegex }
//             ]
//         });
//        res.render('dashboard',{users:userData});    
//     } catch (error) {
//         console.log(error.message);
//     }
// }

const changeUserPassword = async (req, res) => {
    try {
        const userId = req.session.user_id;
        let newpwd = req.body.newpassword;
        let cnfpwd = req.body.confirmpassword;
        const userData = await User.findById(userId);
        const currentpwd = req.body.currentpassword;

        if (newpwd == cnfpwd) {

            let newbr = await securePassword(newpwd);
            let cnfbr = await securePassword(cnfpwd);
            const passwordMatch = await bcrypt.compare(currentpwd, userData.password);
            if (passwordMatch) {
                const updateUserPassword = await User.findByIdAndUpdate(userId, { password: cnfbr });

                res.redirect('/user');
            } else {
                res.redirect('/user')
            }
        } else {
            res.redirect('/user');
        }

    } catch (error) {
        console.log(error.message);
    }
}

const forgotPassword = async (req, res) => {
    try {
        const messge = req.flash('msg');
        res.render('forgotPassword', { messge });
    } catch (error) {
        console.log(error.message);
        res.json('error');
    }
}

const updateForgotPassword = async (req, res) => {
    try {
        const email = req.body.email;
        // console.log(email);
        req.session.email = email;
        // console.log(req.session.email,'emailsession')
        const userData = await User.findOne({ email: email });
        // console.log(userData);
        if (userData) {
            const otp = generateOTP();
            saveOTP(req.body.email, otp)
            console.log('otp isssss', otp)
            res.render('forgotOtp');
        }
        else {
            req.flash('msg', 'Email Id is not Registered....');
            res.redirect('/forgotPassword');
        }
        // sendVerifyMail(req.body.name, req.body.email, userData._id, otp);
        // req.session.user_id = userData._id;
        // console.log('forgot pwd otp', otp);
        // console.log(userData._id,'ooooootttttppppp');
    } catch (error) {
        console.log(error.message);
    }
}

const verifyForgotPassword = async (req, res) => {
    try {
        const enteredOtp = req.body.otp.join('');
        const userOtp = await OTP.findOne({});
        const userData = await User.findOne({ email: userOtp.email });
        // console.log(req.session.email,'dssdinlkd')
        // console.log(userData)
        console.log('uuuuuuuuuu', enteredOtp);
        // console.log(typeof(userOtp.otp),'userotp');
        // console.log(typeof(enteredOtp),'enteredOtp')
        if (userOtp.otp === enteredOtp) {
            // req.session.user_id = userData._id;
            // console.log(req.session.user_id)
            res.render('changePassword');

        }
        else {
            req.flash('msg', 'Enter correct Otp...')
            res.redirect('/forgotPassword');
        }
        // console.log(typeof(enteredOtp));
    } catch (error) {
        console.log(error.message);
        res.json('error');
    }
}

const updateForgotNewPassword = async (req, res) => {
    try {
        console.log('hey');
        let newpwd = req.body.newpwd;
        let cnfpwd = req.body.cnfnewpwd;
        const userData = await User.findOne({ email: req.session.email });
        console.log(userData);
        // console.log(req.session.email,'mmmmsssiondn')
        if (newpwd === cnfpwd) {
            console.log('matched');
            let newpw = await securePassword(newpwd);
            console.log('newpw', newpw);
            const updatePwd = await User.findByIdAndUpdate(userData._id, { password: newpw });
            req.session.user_id = userData._id;
            res.redirect('/')
        } else {
            req.flash('msg', 'new password && confirm password should be same');
            res.redirect('/forgotPassword');
        }
    } catch (error) {
        console.log(error.message);
        res.json('error');
    }
}

const loadShop = async (req, res) => {
    try {
        let category = req.params.id;
        const categories = await Category.find({ is_blocked: false })

        let displayProducts;
        if (!category)
            displayProducts = await Product.find({ is_Unlisted: false });
        else
            displayProducts = await Product.find({ categoryId: category, is_Unlisted: false });

        res.render('shop', { display: displayProducts, categories: categories });
    } catch (error) {
        console.log(error.message)
    }
}

const loadSearch = async (req, res) => {
    const searchData = req.body.search;
    console.log('searchData', searchData);
    try {
        const categories = await Category.find({ is_blocked: false });
        const productData = await Product.find({
            name: { $regex: searchData, $options: 'i' },
            is_Unlisted: false
        });

        if (productData.length > 0) {
            res.render('shop', { display: productData, categories: categories, searchTerm: searchData });
        } else {
            res.render('shop', { display: [], categories: categories, searchTerm: searchData, message: `NO Products Found For ${searchData}`  });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error searching for products', error });
    }
}

// const loadOrderedProducts = async (req, res) => {
//     try {

//         res.redirect('/user');
//     } catch (error) {
//         console.log(error.message);
//     }
// }

const cancelProducts = async (req, res) => {
    try {
        const productId = req.query.productId;
        console.log(productId);
        const result = await Order.findOneAndUpdate(
            { 'orderedItems._id': new mongoose.Types.ObjectId(productId) },
            { $set: { "orderedItems.$.status": 'cancelled' } },
            { new: true }
        );
        console.log('result',result);
        if (result) {
            res.json({ success: true })
        } else {
            res.json({ success: false })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, error: error.message })
    }
}

module.exports = {
    loginLoad,
    loadSignin,
    insertUser,
    verifyMail,
    saveOTP,
    loadHome,
    loadOtp,
    loadShop,
    verifyLogin,
    loadAbout,
    loadServices,
    loadBlog,
    loadContact,
    loadProfile,
    loadLogout,
    loadCheckout,
    updateProfile,
    changeUserPassword,
    forgotPassword,
    updateForgotPassword,
    verifyForgotPassword,
    updateForgotNewPassword,
    loadSearch,
    // loadOrderedProducts,
    cancelProducts,
}