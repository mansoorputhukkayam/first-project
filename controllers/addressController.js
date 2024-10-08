const Address = require('../models/addressModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');


const addAddress = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const newaddress = new Address({
            userId: userId,
            name: req.body.name,
            mobile: req.body.mobile,
            address: req.body.address,
            locality: req.body.locality,
            state: req.body.state,
            post: req.body.post,
            pincode: req.body.pincode
        })
        await newaddress.save();
        console.log('address added', newaddress);
        res.redirect('/user');
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

const checkOutAddAddress = async (req, res) => {
    try {
        console.log('here is reached ')
        const userId = req.session.user_id;
        const checkOutAddress = new Address({
            userId: userId,
            name: req.body.name,
            mobile: req.body.mobile,
            address: req.body.address,
            locality: req.body.locality,
            state: req.body.state,
            post: req.body.post,
            pincode: req.body.pincode
        })
        await checkOutAddress.save();
        console.log('checkoutadresssssssssssssssssss', checkOutAddress);
        res.redirect('/loadCheckOut');
    } catch {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

const updateAddress = async (req, res) => {
    try {
        const addressId = req.body.id;
        // console.log('adadupdate',addressId);
        const { name, mobile, address, locality, state, post, pincode } = req.body;

        const updatedAddress = await Address.findByIdAndUpdate(addressId, { name, mobile, address, locality, state, post, pincode }, { new: true });
        res.redirect('/user');

    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

const deleteAddress = async (req, res) => {
    try {
        const id = req.params.id;
        console.log('dellete', id);
        const delet = await Address.findByIdAndDelete(id);
        res.redirect('/user');
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

module.exports = {
    addAddress,
    updateAddress,
    deleteAddress,
    checkOutAddAddress,

}