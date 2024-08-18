const Coupon = require('../models/couponModel');
const Cart = require('../models/cartModel');

const viewCoupon = async (req, res) => {
    try {
        console.log('its view coupon');
        const coupons = await Coupon.find({}).sort({ _id: -1 });
        console.log('availabl cpns', coupons);
        res.render('coupon', { coupons });

    } catch (error) {
        console.log('error', error);
        res.status(500).render('error-500');
    }

}

const loadAddCoupon = async (req, res) => {
    try {
        const coupons = await Coupon.find({});
        console.log('load add coupon');
        res.render('addCoupon', { coupons });
    } catch (error) {
        console.log('error adding coupon', error);
        res.status(500).render('error-500');
    }
}

const addCoupon = async (req, res) => {
    try {
        console.log('POST add coupon');
        const { couponName, couponCode, discount, expiryDate, criteria } = req.body;
        // const code = req.body.couponcode;
        console.log('this is reqbody', req.body);
        const coupon = await Coupon.findOne({ couponCode: couponCode });
        console.log(coupon, 'cccccc');

        if (coupon) {
            res.status(200).json({ exist: true })
        }
        else {

            let newCoupon = new Coupon({
                couponName: couponName,
                couponCode: couponCode,
                discountAmount: discount,
                activationDate: new Date(),
                expiryDate: expiryDate,
                criteriaAmount: criteria
            })
            let couponData = await newCoupon.save();
            console.log('saved couponData', couponData);
            res.status(200).json({ couponSuccess: true });
        }

    } catch (error) {
        console.log('error addcoupon', error);
        res.status(500).render('error-500');
    }
}

const editCoupon = async (req, res) => {
    try {
        console.log('edit coupon');
        const couponId = req.params.id;
        console.log('couponId', couponId);
        const couponData = await Coupon.findById(couponId);
        // console.log('couponData',couponData);
        res.render('editCoupon', { couponData });
    } catch (error) {
        console.log('error editcoupon:', error);
        res.status(500).render('error-500');
    }
}

const updateCoupon = async (req, res) => {
    try {
        console.log('updateCoupn');
        const couponId = req.body.id;
        console.log('couponId', couponId);
        const { couponName, couponCode, discount, expiryDate, criteria } = req.body;
        console.log('reqbody', req.body);

        const existingCoupon = await Coupon.findOne({ couponCode: couponCode, _id: { $ne: couponId } });
        if (existingCoupon) {
            res.status(200).json({ exist: true });

        } else {

            const updatedCoupon = await Coupon.findByIdAndUpdate(couponId,
                {
                    couponName: couponName,
                    couponCode: couponCode,
                    discountAmount: discount,
                    expiryDate: expiryDate,
                    criteriaAmount: criteria
                },
                { new: true });
            res.status(200).json({ updateStatus: true });
        }
    } catch (error) {
        console.log('error updating coupon', error);
        res.status(500).render('error-500');
    }
}

const deleteCoupon = async (req, res) => {
    try {
        console.log('delete');
        const couponId = req.params.id;
        console.log('coll', couponId);
        const deleteCoupon = await Coupon.deleteOne({ _id: couponId });
        res.status(200).json({ deleteSuccess: true });
    } catch (error) {
        console.log('error deleting', error);
        res.status(500).render('error-500');
    }
}

const applyCoupon = async (req, res) => {
    try {
        console.log('its applied coupons ');
        const userId = req.session.user_id;
        const couponId = req.body.couponId;
        const currentDate = new Date();
        console.log('currentDate', currentDate);
        const couponData = await Coupon.findOne({ _id: couponId });
        const baseAmount = couponData.criteriaAmount;
        const expiryDate = couponData.expiryDate;
        console.log('expiryDate', expiryDate);
        console.log('base Amount', baseAmount);
        const cartData = await Cart.findOne({ userId: userId });
        const cartTotal = cartData.total;
        console.log('cartTotal ', cartTotal);

        const finalPrice = (cartData.total * (100 - couponData.discountAmount) / 100);
        console.log('finalPrice', finalPrice);
        const couponAmount = cartData.total * (couponData.discountAmount / 100);
        console.log('couponAmount', couponAmount);

        req.session.couponAmount = couponAmount;

        if (cartTotal < baseAmount) {
            return res.json({ coupon: true });
        }
        if (expiryDate < currentDate) {
            return res.json({ date: true });
        }

        const userIdExist = couponData.usedUser.includes(userId);
        // console.log('useridexist a',userIdExist);

        if (couponData) {
            if (userIdExist) {
                return res.json({ user: true });
            }
            const cartResult = await Cart.findOneAndUpdate(
                { userId: userId },
                { $set: { total: finalPrice, couponDiscount: couponData._id } },
                { new: true }
            );

            // console.log('cartRaesult',cartResult);

            req.session.couponUsed = couponData;
            // console.log('reqsesoncoupnd',req.session);
            // console.log('dddddddd',req.session.couponUsed);
            await Coupon.findOneAndUpdate(
                { _id: couponData._id },
                { $addToSet: { usedUser: userId } }
            );

            res.json({ success: true });
        }

    } catch (error) {
        console.log('error applying coupon:', error);
        res.status(500).render('Error-500');
    }
}

const removeCoupon = async (req, res) => {
    try {
        console.log('remove coupon s success');
        const userId = req.session.user_id;
        const couponId = req.body.couponId;
        const cartData = await Cart.findOne({ userId: userId });
        const cartPrice = cartData.price;
        console.log('cartPrice', cartPrice);
        console.log('couponId', couponId);
        req.session.couponAmount = null;
        const updatedCoupon = await Coupon.findByIdAndUpdate({ _id: couponId }, { $pull: { usedUser: { $in: [userId] } } }, { new: true });
        const updatedCart = await Cart.findOneAndUpdate({ userId: userId }, { $set: { couponDiscount: null, total: cartPrice } });
        res.status(200).json({ success: true });
    } catch (error) {
        console.log('remove coupon error:', error);
        res.status(500).render('Error-500');
    }
}

module.exports = {
    viewCoupon,
    addCoupon,
    loadAddCoupon,
    editCoupon,
    updateCoupon,
    deleteCoupon,
    applyCoupon,
    removeCoupon,

}