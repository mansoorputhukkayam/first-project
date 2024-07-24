const Coupon = require('../models/couponModel');

const viewCoupon = async(req,res) => {
    try {
        console.log('its view coupon');
        const coupons = await Coupon.find({});
        console.log('availabl cpns',coupons);
        res.render('coupon',{coupons});
        
    } catch (error) {
        console.log('error',error);
    }

}

const loadAddCoupon = async(req,res) => {
    try {
        const coupons = await Coupon.find({});
        console.log('load add coupon');
        res.render('addCoupon',{coupons});
    } catch (error) {
        console.log('error adding coupon', error);
    }
}

const addCoupon = async(req,res) => {
    try {
        console.log('POST add coupon');
        const {couponName,couponCode,discount,createdDate,expiryDate,criteria} = req.body;
        console.log('this is reqbody',req.body);
        let newCoupon = new Coupon({
            couponName : couponName,
            couponCode : couponCode,
            discountAmount: discount,
            activationDate : new Date(),
            expiryDate : expiryDate,
            criteriaAmount : criteria
        })
        let couponData = await newCoupon.save();
        console.log('saved couponData',couponData);
        res.status(200).json({couponSuccess:true}); 

    } catch (error) {
       console.log('error addcoupon',error) 
    }
}

const editCoupon = async(req,res) =>{
    try {
        console.log('edit coupon');
        const couponId = req.params.id;
        console.log('couponId',couponId);
        const couponData = await Coupon.find({_id:couponId});
        // console.log('couponData',couponData);
        res.render('editCoupon',{couponData});
    } catch (error) {
        console.log('error editcoupon:',error);
    }
}

const updateCoupon = async(req,res) =>{
    try {
        console.log('updateCoupn');
        const couponId = req.body.id;
        console.log('couponId',couponId);
        const {couponName,couponCode,discount,expiryDate,criteria} = req.body;
        console.log('reqbody',req.body);
        const newCoupon = await Coupon.findByIdAndUpdate(couponId,
            {couponName:couponName,couponCode:couponCode,discountAmount:discount,expiryDate:expiryDate,criteriaAmount:criteria},
            {new:true});
        res.status(200).json({updateStatus:true});
    } catch (error) {
        console.log('error updating coupon',error);
    }
}

const deleteCoupon = async(req,res) =>{
    try {
        console.log('delete');
        const couponId = req.params.id;
        console.log('coll',couponId);
        const deleteCoupon = await Coupon.deleteOne({_id:couponId});
        res.status(200).json({deleteSuccess:true});
    } catch (error) {
        console.log('error deleting',error);
        res.status(500).json({ deleteSuccess: false });
    }
}


module.exports = {
    viewCoupon,
    addCoupon,
    loadAddCoupon,
    editCoupon,
    updateCoupon,
    deleteCoupon,

}