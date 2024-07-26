const Wallet = require('../models/walletModel');

const getWallet = async(req,res) =>{
    try {
        const {user_id} = req.session;
        const userWallet = await Wallet.findOne({userId:user_id});
        res.render('wallet',{userWallet});
    } catch (error) {
        console.log('getting wallet error:',error);
    }
}

module.exports = {
    getWallet
}