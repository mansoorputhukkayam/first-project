const Admin = require('../models/adminModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');

const loadProductList = async (req, res) => {
    try {
        const savedProducts = await Product.find().populate('categoryId').exec();
        res.render('products', { savedProducts: savedProducts });
    } catch (error) {
        console.log(error.message);
    }
}


const loadProducts = async (req, res) => {
    try {
        console.log(req.query.id)
        const product = await Product.findOne({ _id: req.query.id })
        // console.log(product, 'kiytyyy')
        const msg = req.flash('msg');
        res.render('product', { product: product,msg })
    } catch (error) {
        console.log(error.message);
    }
}

const insertProduct = async (req, res) => {
    try {
        console.log('jjjj')

        if (!req.files || req.files.length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        // Assuming req.files is an array of uploaded files, as configured by multer
        const imagePaths = req.files.map(file => file.filename);
        console.log('update aavuo', req.body.category)
        // Create a new product instance

        const product = new Product({
            name: req.body.name,
            price: req.body.price,
            image: imagePaths, // Store the paths to the uploaded images
            categoryId: req.body.category, // Ensure this is an ObjectId or handle accordingly
            quantity: req.body.quantity,
            description: req.body.description,
            status: req.body.status,

            // Adjust this part based on how you're handling the cropped image data
            croppedImageData: req.body.croppedImageData
        });
        // Save the product to the database
        const savedProduct = await product.save();
        console.log('Product added:', savedProduct);
        res.json({ success: true, message: 'Product added Successfully' });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ success: false, message: 'Error adding product' });
    }
};

const loadAddProduct = async (req, res) => {
    try {
        const categories = await Category.find({})
        res.render('addProduct', { categories });
    } catch (error) {
        console.log(error.message);
    }
}

const productUnlistAndList = async (req, res) => {
    try {

        // const userId = req.session.user_id;
        // const user = await User.findById(userId);
        // console.log('testinhhhhh',user);

        const productId = req.query.id;
        // console.log('prrrrrrrr',productId);

        const productData = await Product.findById(productId);
        //   console.log('bloccccc',productData)

        const update = await Product.updateOne({ _id: productData._id }, { $set: { is_Unlisted: !productData.is_Unlisted } });
        res.redirect('/admin/products');
        //   console.log('pppppppp>>>>>',update);
        //   res.json({isBlocked:userData.is_blocked});

    } catch (error) {
        console.log('error changing blocking status');
        console.log(error);
        res.status(500).json({ res: false, error: 'Internal server error' });
    }
}

const editProduct = async (req, res) => {
    try {
        const id = req.params.productId
        const category = await Category.find({ is_blocked: false }).select('categoryName _id')
        const productById = await Product.findById({ _id: id });
        // console.log(category, 'prdctiddd');r

        if (productById) {
            res.render('editProduct', { productById, category });
        } else {
            return res.status(404).send('product not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('server error');
    }
}

const updateProduct = async (req, res) => {
    try {
        const productId = req.body._id;
        const updatedProduct = {
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            quantity: req.body.quantity,
            category: req.body.category,
        };

        // Find the product in the database
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Handle image replacement
        if (req.files && req.files.length > 0) {
            // Assuming that each new image replaces the corresponding existing image
            req.files.forEach((file, index) => {
                if (product.image[index]) {
                    product.image[index] = file.filename;
                } else {
                    product.image.push(file.filename);
                }
            });
        }

        // Update other product details
        product.name = updatedProduct.name;
        product.price = updatedProduct.price;
        product.description = updatedProduct.description;
        product.quantity = updatedProduct.quantity;
        product.category = updatedProduct.category;

        // Save the updated product
        await product.save();

        // Update other product details
        const updatedProductData = await Product.findByIdAndUpdate(productId, updatedProduct, { new: true });

        if (updatedProductData) {
            res.json({ success: true, message: 'Product updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


const filterProducts = async (req, res) => {
    try {
        const sortBy = req.query.sort;
        let products = getProducts(); // Assume this function fetches your products
        switch (sortBy) {
            case 'popularity':
                products = sortByPopularity(products);
                break;
            case 'priceAsc':
                products = sortByPriceAsc(products);
                break;
            case 'priceDesc':
                products = sortByPriceDesc(products);
                break;
            case 'rating':
                products = sortByRating(products);
                break;
            case 'featured':
                products = filterFeatured(products);
                break;
            case 'newArrivals':
                products = filterNewArrivals(products);
                break;
            case 'nameAsc':
                products = sortByNameAsc(products);
                break;
            case 'nameDesc':
                products = sortByNameDesc(products);
                break;
            default:
                // Default sorting or filtering logic
                break;

                res.render('products', { products });
        }
    }
    catch (error) {
        console.log(error.message);
    }
}

function sortByPriceAsc(products) {
    return products.sort((a, b) => a.price - b.price);
}

const lowHigh = async (req, res) => {
    try {
        const categories = await Category.find()
        const display = await Product.find().sort({ price: 1 });
        res.render('filter', { categories, display });
    } catch (error) {
        console.log(error.message);
        res.json('error')
    }
}

const highLow = async (req, res) => {
    try {
        const categories = await Category.find()
        const display = await Product.find().sort({ price: -1 });
        res.render('filter', { categories, display });
    } catch (error) {
        console.log(error.message);
        res.json('error')
    }
}

const nameAscending = async (req, res) => {
    try {
        const categories = await Category.find();
        const display = await Product.find().sort({ name: 1 });
        res.render('filter', { categories, display });
    } catch (error) {
        console.log(error.message);
        res.json('error');
    }
}

const nameDescending = async (req, res) => {
    try {
        const categories = await Category.find();
        const display = await Product.find().sort({ name: -1 });
        res.render('filter', { categories, display });
    } catch (error) {
        console.log(error.message);
        res.json('error')
    }
}
module.exports = {
    loadProductList,
    insertProduct,
    loadAddProduct,
    productUnlistAndList,
    editProduct,
    updateProduct,
    filterProducts,
    lowHigh,
    highLow,
    nameAscending,
    nameDescending,
    loadProducts,
} 