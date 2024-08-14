const Offer = require('../models/offerModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

const viewOffer = async (req, res) => {
    try {
        const offer = await Offer.find({}).sort({ _id: -1 });
        console.log('its viewing offer');
        res.status(200).render('offer', { offer });
    } catch (error) {
        console.log('viewing offer is error:', error);
    }
}

const getAddOffer = async (req, res) => {
    try {
        console.log('hey ists getAddoffer');
        const products = await Product.find({});
        const categories = await Category.find({});
        // console.log('prdec',products);
        res.render('addOffer', { products, categories });
    } catch (error) {
        console.log('error for load addOffer:', error);
    }
}

const addOffer = async (req, res) => {
    try {
        console.log('add offfer');
        const { name, offerType, product, category, discountPercentage, expiryDate } = req.body;
        let newOffer = new Offer({
            offerName: name,
            discountPercentage: discountPercentage,
            offerType: offerType,
            expiryDate: expiryDate
        })
        let offerData = await newOffer.save();
        console.log('offerData', offerData);

        if (offerType === 'product') {
            newOffer.product = product;
            const productDetails = await Product.findOne({ _id: product });
            await Product.findByIdAndUpdate(
                { _id: product },
                {
                    $set: {
                        productOfferId: newOffer._id,
                        productDiscount: discountPercentage,
                        price: productDetails.price - (productDetails.price * discountPercentage / 100)
                    }
                }
            );
        } else if (offerType === 'category') {
            newOffer.category = category;
            const categoryProducts = await Product.find({ categoryId: category });
            categoryProducts.map(async (product) => {
                await Product.findOneAndUpdate(
                    { _id: product._id },
                    {
                        $set: {
                            categoryOfferId: newOffer._id,
                            categoryDiscount: discountPercentage,
                            price: product.price - (product.price * discountPercentage / 100)
                        }
                    }
                );
            })
        }

        const savedOffer = await newOffer.save();

        if (savedOffer) {
            res.status(200).json({ offerSuccess: true });
        }

    } catch (error) {
        console.log('adding offer error:', error);
        res.status(500).json({ offerSuccess: false });
    }
}

const removeOffer = async (req, res) => {
    try {
        console.log('revmove offer');
        const offerId = req.body.offerId;
        console.log('offerID', offerId);
        const updatedOffer = await Offer.findOneAndUpdate({ _id: offerId }, { $set: { isActive: false } }, { new: true });

        if (updatedOffer.offerType === 'product') {
            const offerApplied = await Product.find({ productOfferId: offerId });

            offerApplied.map(async (product) => {
                await Product.findOneAndUpdate(
                    { _id: product._id },
                    {
                        $set: {
                            price: product.orgPrice,
                            productOfferId: null,
                            productDiscount: null
                        }
                    }
                );
            });
        } else if (updatedOffer.offerType === 'category') {
            const offerApplied = await Product.find({ categoryOfferId: offerId });

            await Promise.all(offerApplied.map(async (product) => {
                await Product.findOneAndUpdate(
                    { _id: product._id },
                    {
                        $set: {
                            price: product.orgPrice,
                            categoryOfferId: null,
                            categoryDiscount: null
                        }
                    }
                );
            }));
        }
        res.json({ updated: true, updatedOffer });

    } catch (error) {
        console.log('romoving offer error:', error);
    }
}

const reactivateOffer = async (req, res) => {
    try {
        console.log('offer reactivating...');
        const offerId = req.body.offerId;
        console.log('ooooo',offerId);
        const updatedOffer = await Offer.findOneAndUpdate({ _id: offerId }, { $set: { isActive: true } }, { new: true });
        console.log('hhh',updatedOffer)

        if (updatedOffer.offerType === 'product') {
            const productDetails = await Product.findOne({ _id: updatedOffer.product });
            await Product.findByIdAndUpdate(
                { _id: updatedOffer.product },
                {
                    $set: {
                        productOfferId: updatedOffer._id,
                        productDiscount: updatedOffer.discountPercentage,
                        price: productDetails.price - (productDetails.price * updatedOffer.discountPercentage / 100)
                    }
                }
            );
        } else if (updatedOffer.offerType === 'category') {
            const categoryProducts = await Product.find({ categoryId: updatedOffer.category });
                categoryProducts.map(async (product) => {
                    await Product.findOneAndUpdate(
                        { _id: product._id },
                        {
                            $set: {
                                categoryOfferId: updatedOffer._id,
                                categoryDiscount: updatedOffer.discountPercentage,
                                price: product.price - (product.price * updatedOffer.discountPercentage / 100)
                            }
                        }
                    );
                })
        }
        res.json({ updated: true, updatedOffer });

    } catch (error) {
        console.log('error for activate offer:', error);
    }
}

// const editOffer = async (req, res) => {
//     try {
//         const offerId = req.params.id;
//         console.log('offerId', offerId);
//         const offerData = await Offer.find({ _id: offerId })
//         console.log('offerData', offerData);
//         res.render('editOffer', { offerData });
//     } catch (error) {
//         console.log('edit offer error', error);
//     }
// }

// const updateOffer = async (req, res) => {
//     try {
//         // console.log('update stated');
//         const offerId = req.body.id;
//         const { offerName, discountPercentage, offerType, expiryDate } = req.body;

//         const newOffer = await Offer.findByIdAndUpdate(offerId, { offerName, discountPercentage, offerType, expiryDate }, { new: true });
//         console.log('update Success', newOffer);
//         res.status(200).json({ updateSuccess: true });

//     } catch (error) {
//         console.log('updating offer:', error);
//     }
// }

const deleteOffer = async (req, res) => {
    try {
        console.log('delter offer');
        const offerId = req.params.id;
        const deleteData = await Offer.deleteOne({ _id: offerId });
        res.status(200).json({ deleteOffer: true });
    } catch (error) {
        console.log('offer deleting error:', error);
        res.status(500).json({ deleteOffer: false });
    }
}


module.exports = {
    viewOffer,
    addOffer,
    getAddOffer,
    // editOffer,
    // updateOffer,
    deleteOffer,
    removeOffer,
    reactivateOffer,
}