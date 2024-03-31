const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controllers/adminControllers');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const path = require('path');


const multer = require('multer');
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/productImages'));

    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    }
});

const upload = multer({storage:storage});

const bodyParser = require('body-parser');
adminRouter.use(bodyParser.json());
adminRouter.use(bodyParser.urlencoded({extended:true}));
    
const auth = require('../middleware/adminAuth');

adminRouter.get('/',auth.isLogout,adminController.loadLogin);
adminRouter.get('/login',auth.isLogout,adminController.loadLogin);
adminRouter.get('/logout',adminController.loadLogout);
adminRouter.get('/category',auth.isLogin,categoryController.loadCategory);
adminRouter.get('/products',productController.loadProduct);
adminRouter.get('/editcategory',auth.isLogin,categoryController.editCategory);
adminRouter.get('/customers',auth.isLogin,adminController.loadCustomers);
adminRouter.get('/blockUnblock',auth.isLogin,adminController.userBlock);
adminRouter.get('/home',auth.isLogin,adminController.loadHome);
adminRouter.get('/add-product',auth.isLogin,productController.addProduct);
adminRouter.get('/catBlockUnblock',auth.isLogin,categoryController.catBlock);
adminRouter.get('/productUnlistAndList',auth.isLogin,productController.productUnlistAndList);
adminRouter.get('/editProduct/:productId',productController.editProduct);

adminRouter.post('/upload-product',upload.array('images'),productController.uploadProduct);
adminRouter.post('/editcategory/:categorybyid',categoryController.updateCategory);
adminRouter.post('/updateProduct',upload.array('images'),productController.updateProduct);

adminRouter.post('/login',adminController.verifyLogin);
adminRouter.post('/addcat',categoryController.addCategory);
 


   
module.exports = adminRouter;