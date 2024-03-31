const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const OTP = require('../models/signUpOtp')
const Product = require('../models/productModel');

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
const securePassword = async(password)=>{
    try{
        const passwordHash = bcrypt.hash(password,10);
        return passwordHash;
    } catch (error) {
           console.log(error.message);
    }
}

const sendVerifyMail = async(name,email,user_id,otp)=>{
    try {
       const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:'mansoorputhukkayam@gmail.com',
                pass:'vbss bhpb juzr mkwi'
            }
        });
        const mailOptions = {
            from:'mansoorputhukkayam@gmail.com',
            to:email,
            subject:'For OTP Verification ',
            text:`Your OTP (One-Time-Password) for Verificaton is: ${otp}`
        };
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }
            else{
                console.log("Email has been sent: -",info.response);
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

const loadProduct = async(req,res)=>{
    try {
        res.render('product')
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
const loadOtp = async (req,res)=> {
    try {
        res.render('signupotp')
    } catch (error) {
        console.log(error.message);
    }
}
const insertUser = async (req,res) => {
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
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mobile,
            password:spassword,
            is_admin:0
        });
        const userData = await user.save();
        if(userData) {
            const otp = generateOTP();
            saveOTP(req.body.email,otp)
            sendVerifyMail(req.body.name,req.body.email,userData._id,otp);
            console.log('jjjjj',otp);
            req.session.user_id = userData._id;
            res.render('signupotp')
        }
        else{
            res.render('signin',{message:'your registration is failed...'})
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
        
        if (!userOtp)  return res.render('signupotp', { message: "OTP is incorrect...!!" });
        else  res.render('home');
       
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

const loadProfile = async (req,res)=>{
    try {
        res.render('user');
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req, res) => {
    try {
        console.log('keeeriii>>>>>>>>>')
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email});
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if(userData.is_blocked === false){
                    req.session.user_id = userData._id;
                    res.redirect('/');
                }
                else{
                    res.render('login',{message:"You are blocked by Admin..."});
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
const loadShop = async (req,res) =>{
    try {
        const displayProducts = await Product.find()
        res.render('shop',{display:displayProducts})
    } catch (error) {
        console.log(error.message)
    }
}
const loadAbout = async (req,res) =>{
    try {
        res.render('about');
    }
    catch (error) {
        console.log(error.message)
    }
}

const loadServices = async (req,res) =>{
    try {
        res.render('services')
    } catch (error) {
        console.log(error.message);
    }
}

const loadBlog = async (req,res) =>{
    try {
        res.render('blog');
    } catch (error) {
        console.log(error.message);
    }
}

const loadContact = async (req,res)=>{
    try {
        res.render('contact');
    } catch (error) {
        console.log(error.message);
    }
}
const loadCart = async (req,res) =>{
    try {
        res.render('cart');
    } catch (error) {
        console.log(error.message);
    }
}


const loadLogout = async(req,res)=>{
    try {
        req.session.user_id = null;
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
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
    loadCart,
    loadProduct,
    loadProfile,
    loadLogout
}