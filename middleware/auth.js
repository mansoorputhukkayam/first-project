const User = require('../models/userModel');

const isLogin = async(req,res,next)=>{
    try {
        if(req.session.user_id) next();
        else res.redirect('/login');
      } catch (error) {
        console.log(error.message)
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if(req.session.user_id)  res.redirect('/login');
        else  next();
    } catch (error) {
        console.log(error.message)
    }
}
const isBlocked = async (req, res, next) => {
    try {
        const userId = req.session.user_id;
        const userDb = await User.findOne({ _id: userId });
        if (userDb?.is_blocked) {
          req.session.user_id = null;
          res.redirect("/");
        } else {
            next();
        }
    } catch (error){
        console.log('errr>>>>>>>>>>>>>>')   
        console.log(error.message);
    }
  }

module.exports = {
    isLogin,
    isLogout,
    isBlocked
}