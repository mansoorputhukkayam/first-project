
const Cart = require('../models/cartModel');
const Address = require('../models/addressModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Wallet = require('../models/walletModel');

let instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET
});

const loadCheckout = async (req, res) => {
    try {
        const userId = req.session.user_id;
        console.log('session',userId)
        const userCartData = await Cart.find({ userId });
        // console.log('usercardDAta',userCartData)
        const addressData = await Address.find({ userId });
        // console.log('addressData', addressData)

        const wallet = await Wallet.findOne({ userId: userId });
        // console.log('wallet DAta',wallet);
        console.log('walletBAlance', wallet.balance);
        const userCartTotal = userCartData.reduce((total, cart) => total + cart.total, 0);
        console.log('usercartTotal', userCartTotal)
        res.render('checkout', { userCartData: userCartData, userCartTotal, addressData, wallet });
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

const placeOrder = async (req, res) => {
    try {
        console.log('eddd')
        // console.log(req.body,'req.body')
        const userId = req.session.user_id;
        const userData = await User.findOne({ _id: userId });
        const userDataId = userData._id;
        let cartData = await Cart.find({ userId });
        const paymentMethod = req.body.paymentMethod;
        console.log('paymetnt', paymentMethod);
        const deliveryAddress = await Address.findOne({ name: req.body.name });
        // console.log('delivery addres', deliveryAddress);
        const deliveryAddressId = deliveryAddress._id;

        const orderStatus = req.body.paymentMethod === 'COD' ? 'Placed' : 'Pending';
        console.log('order Staus ', orderStatus);
        console.log('deliveryaddId', deliveryAddressId);
        const randomInteger = Math.floor(Math.random() * 100000000000);
        console.log('orderId', randomInteger);
        let totalAmount = 0;
        cartData.forEach((i) => (totalAmount += i.total));

        cartData = cartData.map((item) => {
            return { ...item._doc, status: orderStatus };
        });

        const orderData = new Order({
            userId: userDataId,
            deliveryAddress: deliveryAddressId,
            payment: paymentMethod,
            orderId: randomInteger,
            orderAmount: totalAmount,
            status: orderStatus,
            orderedItems: cartData,
        });

        const orderDetails = await orderData.save();
        // console.log(orderDetails, 'orderDetails');
        const orderid = orderDetails._id;
        // console.log('orderid', orderid);
        const order = await Order.find({_id:orderid});

        if (orderStatus == 'Placed') {

            for (const item of orderData.orderedItems) {
                await Order.findOneAndUpdate({ _id: orderid, 'orderedItems.productId': item.productId }, { $set: { 'orderedItems.$.status': 'Placed' } });
                await Product.updateOne({ _id: item.productId }, {
                    $inc: { quantity: -item.quantity, salesCount: +1 }
                })
            }

            await Cart.deleteMany({ userId: userId })
            console.log('deteted cartData');

            res.status(200).json({ codSuccess: true, orderid });

        } else if (paymentMethod == 'Razorpay') {

            const options = {
                amount: totalAmount * 100,
                currency: "INR",
                receipt: orderid,
            };

            instance.orders.create(options, (err, order) => {
                if (err) {
                    console.log('error:', err);
                }
                // console.log('new order:', order);
                res.status(200).json({ onlineSuccess: true, order })
            })

        } else if (paymentMethod === 'Wallet') {

            console.log('its wallet Payment');

            console.log('orderid', orderid);

            const order = await Order.findOne({ _id: orderid });

            const wallet = await Wallet.findOne({ userId: userId });

            if (wallet.balance < order.orderAmount) {
                res.json({ Balance: true })

            } else {
                console.log('else workd aayeee');

                let walletData = await Wallet.updateOne({ userId: userId }, {
                    $inc: { balance: -totalAmount },
                    $push: {
                        history: {
                            Date: new Date().toDateString(),
                            Description: 'Product ordered',
                            Amount: `${totalAmount}`,
                            time: new Date()
                        }
                    }
                })
                
                for (const item of order.orderedItems) {
                    await Order.findOneAndUpdate({ _id: orderid, 'orderedItems.productId': item.productId }, { $set: { 'orderedItems.$.status': 'Placed' } });
                    await Product.updateOne({ _id: item.productId }, {
                        $inc: { quantity: -item.quantity, salesCount: +1 }
                    })
                }

                await Cart.deleteMany({ userId: userId })
                console.log('deteted cartData');

                res.status(200).json({ walletSuccess: true })

            }
        }

        // res.redirect('/thankyou');

    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

const verifyPayment = async (req, res) => {
    try {
        console.log('verifyPayment page loaded');
        const { user_id } = req.session;
        // console.log('req.body', req.body);

        const { response, order } = req.body;
        // console.log('req.body',req.body);
        // console.log('verifypayment')
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body.response;

        // console.log('razorpay-payementid', razorpay_payment_id);
        // console.log('razorpay-orderid', razorpay_order_id);
        // console.log('razorpay-signatiorue', razorpay_signature);


        const hmac = crypto.createHmac('sha256', process.env.KEY_SECRET);
        hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
        const generated_signature = hmac.digest('hex');

        if (generated_signature === razorpay_signature) {

            console.log("Order placed successfully");

            const orderId = order.receipt;
            console.log('ordeeeerId', orderId);
            // const { addressId, paymentMethod, formData } = req.body.orderData

            const orderData = await Order.findOne({ _id: order.receipt }, {});

            // console.log('orderData', orderData);

            for (const item of orderData.orderedItems) {
                await Order.findOneAndUpdate({ _id: order.receipt, 'orderedItems.productId': item.productId }, { $set: { 'orderedItems.$.status': 'Placed', paymentStatus: 'success' } });
                await Product.updateOne({ _id: item.productId }, {
                    $inc: { quantity: -item.quantity, salesCount: +1 }
                })
            }

            // const userCart = await Cart.findOne({ userId: user_id }).populate('productId');
            // console.log('ussssrrcart', userCart);
            // let subTotal = userCart.Products.reduce((total, current) => total + current.productId.offerPrice * current.quantity, 0)


            // let productItems = userCart.Product.map((product) => ({
            //     productId: product.productId,
            //     quantity: product.quantity,
            //     price: product.productId.offerPrice,
            //     totalPrice: product.productId.price * product.quantity,
            //     status: 'Placed'

            // }))


            // let storeOrder = new Order({
            //     userId: user_id,
            //     userName: newAddress.firstName,
            //     shipAddress: [{ name: newAddress.firstName, country: newAddress.country, state: newAddress.state, city: newAddress.town, streetName: newAddress.streetName, pinCode: newAddress.postCode, phone: newAddress.phone, email: newAddress.email }],
            //     orderedProducts: productItems,
            //     purchasedDate: new Date().toDateString(),
            //     paymentMethod: paymentMethod,
            //     subTotal: subTotal,
            //     orderedTime: new Date(),
            //     orderStatus: 'Placed',
            //     shippingCharge: 50


            // })

            // let resultofOrder = await storeOrder.save()
            // const orderId = resultofOrder._id
            // console.log(resultofOrder, 'it is form formdata')
            // orderPlaced(orderId)


            // async function orderPlaced(orderId) {

            // for (const item of productItems) {
            //     await Product.updateOne({ _id: item.productId },
            //         { $inc: { quantity: -item.quantity, salesCount: +1 } }
            //     )

            // }

            // }
            //Aftet placing order , delete cart document
            await Cart.deleteMany({ userId: user_id })

            res.status(200).json({ Success: true })


        }



        // res.status(200).json({ Success: true })

    } catch (err) {
        console.log('error for verifying:',err);
        res.status(500).render('Error-500');
    }
}

const thankyou = async (req, res) => {
    try {
        console.log('hello');           
        // console.log(req.body)
        const userId = req.session.user_id;
        const lastOrder = await Order.findOne({}).sort({ _id: -1 });
       
        const productDetails = lastOrder.orderedItems;
        const productId = productDetails.map(product => product.productId);
        const prdct = await Product.find({ _id: productId }).populate('categoryId');
        // console.log(prdct,'prdcttt')

        res.render('thankyou', { lastOrder, prdct });
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

const failed = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const orderId = req.query.id;
        console.log('ooooo', orderId);
        const orderData = await Order.findOneAndUpdate({ _id: orderId }, { $set: { paymentStatus: 'Failed' } });
        // console.log('orderData',orderData); 
        res.render('failed', { orderId });

    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

const payAgain = async (req, res) => {
    try {
        console.log('inside payagain');
        const orderId = req.query.id;
        console.log('oo', orderId);
        const orderData = await Order.findOne({ _id: orderId });
        console.log('ord', orderData);

        const options = {
            amount: orderData.orderAmount * 100,
            currency: "INR",
            receipt: orderId
        };

        instance.orders.create(options, (err, order) => {
            if (err) {
                console.log("error:", err);
            }
            console.log("new Order:", order);
            res.json({ payAgain: true, order });

        });

    } catch (error) {
        console.log('error paying money:', error);
        res.status(500).render('Error-500');
    }
}

module.exports = {
    loadCheckout,
    placeOrder,
    verifyPayment,
    thankyou,
    failed,
    payAgain,
}
