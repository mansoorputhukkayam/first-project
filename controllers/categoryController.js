const Admin = require('../models/adminModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel')
const mongoose = require('mongoose');

const loadCategory = async(req,res)=>{
    try {
        console.log('edknnddd')
        const category = await Category.find({});
        res.render('categories',{catego:category,})
    } catch (error) {
        console.log(error.message);
    }
}   

const addCategory = async(req,res)=>{
    try {
        const value = await Category.find({categoryName : new RegExp(req.body.category,'i')});
        const {category,description} = req.body
        // const categ = req.body.category;
        // const description = req.body.description;
        if(value.length === 0){
        const catego = new Category({
            categoryName:category,
            description:description 
        });
        console.log('hhhh',description)
        const userData = await catego.save();
        console.log(userData);
            res.status(200).redirect('/admin/category');
        }
        else {
                // Send a JSON response indicating the category already exists
                res.status(400).json({ message: "The category already exists...!!" });
            }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
}

const editCategory = async(req,res)=>{
    try {
           const id = req.query.id;

           const singleCategoryPromise =  Category.findById({_id:id})
           const allCategoryPromise =  Category.find()

           const [fetchCategoryById, fetchAllCategory] = await Promise.all([singleCategoryPromise, allCategoryPromise]);
        //    console.log("iam the catergory by id ", fetchCategoryById);
        //    console.log("iam the catergory all ", fetchAllCategory);
           if (fetchCategoryById && fetchAllCategory) {
               res.render('edit-category', { categorylist:fetchAllCategory, categorybyid:fetchCategoryById });
           }else{
            
           return res.status(404).send('Category not found');
           }
   } catch (error) {
           console.error(error);
           res.status(500).send('Server Error');
   }
}

const updateCategory = async (req,res)=>{
    try {
       
        const categoryId = req.body._id;
        const { categoryName, description } = req.body;

        // // Update the category
        const updatedCategory = await Category.findByIdAndUpdate(categoryId,
            {categoryName,description},{ new: true });
            
        if (!updatedCategory) {
            return res.status(404).send('Category not found');
        }

        res.redirect('/admin/category'); // Redirect to categories page after editing
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
}

const catBlock = async (req, res) => {
    try {
        console.log('blockil keeri...')
        // const userId = req.session.user_id;
        // const user = await User.findById(userId);
        // console.log('testinhhhhh',user);

        const categoryId = req.query.id;
        console.log('fffff',categoryId);

      const catData = await Category.findById(categoryId);
      console.log('bloccccc',catData)
      
      const update = await Category.updateOne({_id:catData._id},{$set:{is_blocked:!catData.is_blocked}});
      res.redirect('/admin/category');
      console.log('hhhhh',update);
    //   res.json({isBlocked:userData.is_blocked});
  
    } catch (error) {
      console.log('error changing blocking status');
      console.log(error);
      res.status(500).json({ res: false, error: 'Internal server error' });
    }
  }
  

module.exports = {
    loadCategory,
    addCategory,
    editCategory,
    updateCategory,
    catBlock

}