const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controllers/adminControllers');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const couponController = require('../controllers/couponController');
const offerController = require('../controllers/offerController');
const path = require('path');


const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/productImages'));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});

const upload = multer({
    storage: storage
});

const bodyParser = require('body-parser');
adminRouter.use(bodyParser.json());
adminRouter.use(bodyParser.urlencoded({extended:true}));
    
const auth = require('../middleware/adminAuth');

adminRouter.get('/',auth.isLogout,adminController.loadLogin);
// adminRouter.get('/login',auth.isLogout,adminController.loadLogin);
adminRouter.get('/category',auth.isLogin,categoryController.loadCategory);
adminRouter.get('/products',auth.isLogin,productController.loadProductList);
adminRouter.get('/editcategory',auth.isLogin,categoryController.editCategory);
adminRouter.get('/customers',auth.isLogin,adminController.loadCustomers);
adminRouter.get('/blockUnblock',auth.isLogin,adminController.userBlock);
adminRouter.get('/home',auth.isLogin,adminController.loadHome);
adminRouter.get('/dashboard',auth.isLogin,adminController.loadDashBoard);
adminRouter.get('/add-product',auth.isLogin,productController.loadAddProduct);
adminRouter.get('/catBlockUnblock',auth.isLogin,categoryController.catBlock);
adminRouter.get('/productUnlistAndList',auth.isLogin,productController.productUnlistAndList);
adminRouter.get('/editProduct/:productId',auth.isLogin,productController.editProduct);
adminRouter.get('/adminOrders',auth.isLogin,adminController.loadAdminOrders);

adminRouter.post('/getChartData',auth.isLogin,adminController.chartData);

adminRouter.get('/getSalesReport',auth.isLogin,adminController.getSalesReport);
adminRouter.post('/searchWithDate',auth.isLogin,adminController.searchWithDate);
adminRouter.get('/sortReport',auth.isLogin,adminController.sortReport);

adminRouter.get('/viewCoupon',auth.isLogin,couponController.viewCoupon);
adminRouter.get('/loadAddCoupon',auth.isLogin,couponController.loadAddCoupon);
adminRouter.get('/editCoupon/:id',auth.isLogin,couponController.editCoupon);
adminRouter.get('/deleteCoupon/:id',auth.isLogin,couponController.deleteCoupon);
adminRouter.post('/coupon',couponController.addCoupon);
adminRouter.post('/updateCoupon',couponController.updateCoupon);

adminRouter.get('/viewOffer',auth.isLogin,offerController.viewOffer);
adminRouter.get('/getAddOffer',auth.isLogin,offerController.getAddOffer);
adminRouter.post('/addOffer',offerController.addOffer);
adminRouter.patch('/removeOffer',offerController.removeOffer);
adminRouter.patch('/reactivateOffer',offerController.reactivateOffer);

// adminRouter.get('/editOffer/:id',auth.isLogin,offerController.editOffer);
// adminRouter.post('/updateOffer',offerController.updateOffer);
adminRouter.get('/deleteOffer/:id',auth.isLogin,offerController.deleteOffer);

adminRouter.post('/productStatus',auth.isLogin,adminController.changeOrderStatus);

adminRouter.post('/logout',adminController.loadLogout);
adminRouter.post('/add-product',upload.array('images'),productController.insertProduct);
adminRouter.post('/editcategory',categoryController.updateCategory);
adminRouter.post('/updateProduct', upload.array('newImages'),productController.updateProduct);

adminRouter.post('/login',adminController.verifyLogin);
adminRouter.post('/addcat',categoryController.addCategory); 
   
module.exports = adminRouter;