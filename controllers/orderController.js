
const Cart = require('../models/cartModel');
const Address = require('../models/addressModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Razorpay = require('razorpay');
const crypto = require('crypto');

let instance = new Razorpay({
    key_id: 'rzp_test_4AB1dm0KvAE5MR',
    key_secret: '8EUhYfAmGN3B5Grn0fGrnUGa'
});

const loadCheckout = async (req, res) => {
    try {
        const userId = req.session.user_id;
        // console.log('session',userId)
        const userCartData = await Cart.find({ userId });
        // console.log('usercardDAta',userCartData)
        const addressData = await Address.find({ userId });
        // console.log('addressData', addressData)
        const userCartTotal = userCartData.reduce((total, cart) => total + cart.total, 0);
        console.log('usercartTotal', userCartTotal)
        res.render('checkout', { userCartData: userCartData, userCartTotal, addressData });
    } catch (error) {
        console.log(error.message)
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
        console.log('orderid', orderid);

        if (orderStatus == 'Placed') {

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
                console.log('new order:', order);
                res.status(200).json({ onlineSuccess: true, order })
            })

        }

        // res.redirect('/thankyou');

    } catch (error) {
        console.log(error.message);

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

        console.log('razorpay-payementid', razorpay_payment_id);
        console.log('razorpay-orderid', razorpay_order_id);
        console.log('razorpay-signatiorue', razorpay_signature);


        const hmac = crypto.createHmac('sha256', '8EUhYfAmGN3B5Grn0fGrnUGa');
        hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
        const generated_signature = hmac.digest('hex');

        if (generated_signature === razorpay_signature) {
            if (req.body.orderId) {  //for retry

                let updateRetry = await Order.updateOne({
                    _id: req.body.orderId,
                    'orderedProducts._id': req.body.productId
                }, {
                    $set:
                    {
                        purchasedDate: new Date().toDateString(),
                        orderStatus: 'Placed',
                        orderedTime: new Date(),
                        'orderedProducts.$.status': 'Placed'


                    }
                })
                //Aftet placing order , delete cart document
                await Cart.deleteOne({ userId: req.session.user_id })
                console.log('quanitry decreased')

                res.json({ retry: true })


            } else {
                console.log("Order placed successfully");

                const orderId = order.receipt;
                console.log('ordeeeerId', orderId);
                // const { addressId, paymentMethod, formData } = req.body.orderData

                const orderData = await Order.findOne({ _id: order.receipt }, {});

                console.log('orderData', orderData);

                for (const item of orderData.orderedItems) {
                    await Order.findOneAndUpdate({ _id: order.receipt, 'orderedItems.productId': item.productId }, { $set: { 'orderedItems.$.status': 'Placed' } });
                    await Product.updateOne({ _id: item.productId }, {
                        $inc: { quantity: -item.quantity }
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


            }
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


        } else {
            console.log("Signature verification failed");
        }



        // res.status(200).json({ Success: true })

    } catch (err) {
        console.log(err);
    }
}

const thankyou = async (req, res) => {
    try {
        console.log('hello');
        // console.log(req.body)
        const userId = req.session.user_id;
        const lastOrder = await Order.findOne({}).sort({ _id: -1 });
        for (let item of lastOrder.orderedItems) {
            await Product.updateOne({ _id: item.productId }, { $inc: { quantity: -item.quantity } })
            // console.log('item-id',item.quantity)
        }
        const productDetails = lastOrder.orderedItems;
        const productId = productDetails.map(product => product.productId);
        const prdct = await Product.find({ _id: productId }).populate('categoryId');
        // console.log(prdct,'prdcttt')

        const del = await Cart.deleteMany({ userId });
        console.log('succes...', del);


        res.render('thankyou', { lastOrder, prdct });
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadCheckout,
    placeOrder,
    verifyPayment,
    thankyou,

}
