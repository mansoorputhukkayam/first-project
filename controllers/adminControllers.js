const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const Category = require('../models/categoryModel')
const Product = require('../models/productModel');
// const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Order = require('../models/orderModel');
const Address = require('../models/addressModel');

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}
const loadLogin = async (req, res) => {
    try {
        // if (req.body.email.trim() == "" || req.body.password.trim() == "") {
        //     res.render("login", { message: "field cant be empty" });
        //   }
        const message = req.flash('msg');
        res.render('login', { message });
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = await securePassword(req.body.password)
        // console.log(email,password)
        const adminData = await Admin.findOne({ email: email });
        if (adminData) {
            // console.log('user ddda',adminData);
            const passwordMatch = await bcrypt.compare(adminData.password, password);
            console.log('password match', passwordMatch);
            if (passwordMatch) {
                req.session.user_id = adminData._id;
                // console.log('its workinnnn')
                return res.redirect('/admin/home')
            }
            else {
                req.flash('msg', 'Password is not correct');
                console.log('pwd errror...')
                return res.redirect('/admin')
            }
        }
        else {
            req.flash('msg', 'Your are not an admin');
            console.log('its worked else')
            return res.redirect('/admin');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadHome = async (req, res) => {
    try {
        res.render('home');
    } catch (error) {
        console.log(error.message);
    }
}



const loadCustomers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        // console.log('page nbr',page);
        const limit = 7;
        const totalUsers = await User.countDocuments();
        // console.log('userToatal',totalUsers);
        // const nextPage = page < totalPages ? page + 1 : null ;

        const users = await User.find().skip((page - 1) * limit).limit(limit).sort({ _id: -1 });

        const currentPage = page;

        const pages = Math.ceil(totalUsers / limit);
        // console.log('pages',pages);

        // const users = await User.find({})
        // console.log('loaaaddddd',users);
        res.render('customers', { users: users, currentPage, pages });
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
        console.log('fffff', user_id);

        const userData = await User.findById(user_id);
        console.log('bloccccc', userData)

        const update = await User.updateOne({ _id: userData._id }, { $set: { is_blocked: !userData.is_blocked } });
        res.redirect('/admin/customers');
        console.log('hhhhh', update);
        //   res.json({isBlocked:userData.is_blocked});

    } catch (error) {
        console.log('error changing blocking status');
        console.log(error);
        res.status(500).json({ res: false, error: 'Internal server error' });
    }
}

const loadLogout = async (req, res) => {
    try {
        // console.log('hey logout')
        req.session.user_id = null;
        res.status(200).send({ message: 'Logged out Successfully...' })
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: 'Error in Logout' });
    }
}

const loadAdminOrders = async (req, res) => {
    try {
        // console.log('hi order admin');
        const page = req.query.page || 1;
        const totalOrders = await Order.countDocuments();
        const currentPage = page;
        const limit = 7;
        const pages = Math.ceil(totalOrders / limit);
        const userId = req.session.user_id;
        const orderDetails = await Order.findOne({}).sort({ _id: -1 });
        // console.log('laast data ', orderDetails)
        const orderData = await Order.find().skip((page - 1) * limit).limit(limit).sort({ _id: -1 }).populate('deliveryAddress').populate('userId').exec();
        // console.log(orderData,'orderDattasa');
        res.render('orders', { orderData: orderData, orderDetails, pages, currentPage });
    } catch (error) {
        console.log(error.message);

    }
}

const changeOrderStatus = async (req, res) => {
    try {
        console.log('hey it is working');
        const { productId, status } = req.body;
        console.log('ProductId:', productId, 'Status:', status);
        const product = new mongoose.Types.ObjectId(productId);

        const result = await Order.findOneAndUpdate(
            { 'orderedItems._id': product },
            { $set: { 'orderedItems.$.status': status } },
            { new: true }
        );
        console.log('result', result);
        if (result) {
            res.json({ success: true, message: 'Status updated successfully' });
        } else {
            res.json({ success: false, message: 'Order not found or not updated successfully' });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json('error')
    }
}

const getSalesReport = async (req, res) => {
    try {
        console.log('hey');

        let report = await Order.find().sort({ createdAt: -1 }).populate('deliveryAddress').exec();
        console.log(report, 'it is reoprt');

        res.render('salesReport', { report });
    } catch (error) {
        console.log('error getting sales report', error);
    }
}

let searchWithDate = async (req, res) => {
    try {

        console.log('serchwithDate');
        let { searchDate } = req.body
        // console.log('sse',req.body.searchDate)

        let searchedDate = new Date(searchDate)

        let startOfDay = new Date(searchedDate.setHours(0, 0, 0, 0));
        let endOfDay = new Date(searchedDate.setHours(23, 59, 59, 999));

        // console.log('Searched date rangedateeeeee:', startOfDay, endOfDay);

        let report = await Order.find({
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).sort({ createdAt: -1 }).populate('deliveryAddress').exec();
        ;

        // console.log('Report found:', report);

        res.render('salesReport', { report });


    } catch (error) {

        console.log('error rendering searchWithDate', error)
    }
}

const sortReport = async (req, res) => {
    try {
        let { sort } = req.query;

        if (sort == 'Day') {
            let today = new Date();

            let startOfDay = new Date(today.setHours(0, 0, 0, 0));
            let endOfDay = new Date(today.setHours(23, 59, 59, 999));

            console.log('Start of day:', startOfDay);
            console.log('End of day:', endOfDay);

            let report = await Order.find({
                createdAt: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            }).sort({ createdAt: -1 }).populate('deliveryAddress').exec();;


            res.render('salesReport', { report });

        } else if (sort == 'Month') {
            let today = new Date();
            let startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            console.log('strtof Month', startOfMonth);

            let report = await Order.find({ createdAt: { $gte: startOfMonth } }).sort({ createdAt: -1 }).populate('deliveryAddress').exec();
            console.log('its reportnmonth', report);
            res.render('salesReport', { report });

        } else if (sort == 'Year') {
            let today = new Date();
            let startOfYear = new Date(today.getFullYear(), 0, 1);

            let report = await Order.find({ createdAt: { $gte: startOfYear } }).sort({ createdAt: -1 }).populate('deliveryAddress').exec();
            console.log('year report', report);
            res.render('salesReport', { report });
        }
    } catch (error) {
        console.log('sorting error', error);
    }
}

const loadDashBoard = async (req, res) => {
    try {

        const OrdersCount = await Order.find({}).count();
        const productsCount = await Product.find({}).count();
        const CategoryCount = await Category.find({}).count();

        const overallData = await Order.aggregate([
            {
                $group: {
                    _id: "",
                    totalSalesCount: { $sum: 1 },
                    totalRevenue: { $sum: '$orderAmount' }
                }

            }
        ])
        // console.log('entered in dashboard',overallData);
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        // console.log('currentMonth',currentMonth);

        //monthly data section
        const monthlyData = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(currentDate.getFullYear(), currentMonth - 1, 1),
                        $lt: new Date(currentDate.getFullYear(), currentMonth, 1)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    totalSalesCount: { $sum: 1 },
                    totalRevenue: { $sum: '$orderAmount' }
                }
            }
        ]);
        console.log('monthData', monthlyData);
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const monthId = monthlyData[0]._id;
        const monthName = monthNames[monthId - 1];
        console.log('monthName', monthName);

        //best selling product

        const bestSoldProducts = await Order.aggregate([
            { $unwind: '$orderedItems' },
            {
                $lookup: {
                    from: 'Product',
                    localField: 'orderedItems.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            // { $unwind: '$productDetails' }
            {
                $group: {
                    _id: '$orderedItems.productId',
                    count: { $sum: '$orderedItems.quantity' },
                    name: { $first: '$orderedItems.productName' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // const bestSoldProducts=await Promise.all(bestSellingProducts.map(async (product)=>{
        //     const count=product.count;
        //     const productDetails=await Products.findOne({_id:product._id});
        //     return {count,productDetails};
        // }))

        //best selling Category
        const bestSoldCategory = await Order.aggregate([
            { $unwind: '$orderedItems' },
            {
                $lookup:
                {
                    from: 'products',
                    localField: 'orderedItems.productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },

            {
                $group: {
                    _id: '$product.categoryId', // Correctly reference the product category
                    totalCategoryCount: { $sum: 1 } // Summing the quantities
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'category'
                }
            },

            { $unwind: '$category' },
          
            {$group:{_id:'$category.categoryName',count:{$sum:'$totalCategoryCount'}}},
            {$sort:{count:-1}},
            {$limit:5}
        ]);
        
        console.log('bestSelled cate3gorires', bestSoldCategory);
            

        res.render('adminDashboard', {
            OrdersCount,
            productsCount,
            CategoryCount,
            overallData,
            monthlyData,
            monthName,
            bestSoldProducts,
            bestSoldCategory
        });

    } catch (error) {
        console.log('error for rendering adminDashborad:', error);

    }
}

const chartData = async (req, res) => {
    try {
        // console.log('chart started');
        const { chartType } = req.body;
        // console.log('chartType:', chartType);

        let barData;

        if (chartType == 'monthly') {
            await monthlyData();
        } else {
            await yearlyData();
        }


        async function monthlyData() {

            const salesData = await Order.aggregate([
                { $match: { orderStatus: { $ne: "pending" } } },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        monthlySalesCount: { $sum: 1 },
                        monthlyRevenue: { $sum: '$orderAmount' },
                    }
                }
            ]);

           
            barData = new Array(12).fill(0);

            salesData.forEach((item) => {
                const monthIndex = item._id - 1;
                barData[monthIndex] = item.monthlyRevenue;
            })
        }

        async function yearlyData() {

            const salesData = await Order.aggregate([
                { $match: { orderStatus: { $ne: "pending" } } },
                {
                    $group: {
                        _id: { $year: "$createdAt" },
                        yearlySalesCount: { $sum: 1 },
                        yearlyRevenue: { $sum: '$orderAmount' },
                    }
                }
            ]);
            // console.log('salesData:', salesData);

            barData = new Array(10).fill(0);
            salesData.forEach((item) => {
                const yearIndex = item._id - 2018
                // console.log('yearIndex:', yearIndex);
                barData[yearIndex] = item.yearlyRevenue;
            })
        }

        res.json({ barData })


    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

module.exports = {
    loadLogin,
    verifyLogin,
    loadCustomers,
    loadLogout,
    loadHome,
    userBlock,
    loadAdminOrders,
    changeOrderStatus,
    getSalesReport,
    searchWithDate,
    sortReport,
    loadDashBoard,
    chartData
}