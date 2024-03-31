const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const Category = require('../models/categoryModel')
const Product = require('../models/productModel');
// const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId

const securePassword = async (password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}
const loadLogin = async (req,res)=>{
    try {
        // if (req.body.email.trim() == "" || req.body.password.trim() == "") {
        //     res.render("login", { message: "field cant be empty" });
        //   }
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email;
        const password = await securePassword(req.body.password)
        // console.log(email,password)
        const adminData = await Admin.findOne({email:email});
        if(adminData){
            // console.log('user ddda',adminData);
            const passwordMatch = await bcrypt.compare(adminData.password,password);
            console.log('password match',passwordMatch);
            if(passwordMatch){
                req.session.user_id= adminData._id;
                // console.log('its workinnnn')
                    return res.redirect('/admin/home')
            } 
            else{
            console.log('pwd errror...')
           return res.redirect('/admin')
            }
        }
        else{
            console.log('its worked else')
           return res.redirect('/admin');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadHome = async (req,res)=>{
    try {
        res.render('home');
    } catch (error) {
        console.log(error.message);
    }
}



const loadCustomers = async(req,res)=>{
    try {
        const users = await User.find({})   
        // console.log('loaaaddddd',users);
        res.render('customers',{users:users});
    } catch (error) {
        console.log(error.message);
    }  
}

const userBlock = async (req, res) => {
    try {
        // console.log('blockil keeri...')
        // const userId = req.session.user_id;
        // const user = await User.findById(userId);
        // console.log('testinhhhhh',user);

        const user_id = req.query.id;
        console.log('fffff',user_id);

      const userData = await User.findById(user_id);
      console.log('bloccccc',userData)
      
      const update = await User.updateOne({_id:userData._id},{$set:{is_blocked:!userData.is_blocked}});
      res.redirect('/admin/customers');
      console.log('hhhhh',update);
    //   res.json({isBlocked:userData.is_blocked});
  
    } catch (error) {
      console.log('error changing blocking status');
      console.log(error);
      res.status(500).json({ res: false, error: 'Internal server error' });
    }
  }
  
const loadLogout = async(req,res)=>{
    try {
        req.session.user_id = null;
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
    }
}




module.exports = {
    loadLogin,
    verifyLogin,
    loadCustomers,
    loadLogout,
    loadHome,
    userBlock,
    // loadCategory,
    // addCategory,
    // loadProduct,
    // editCategory,
    // uploadProduct,
    // addProduct,
    // updateCategory
}