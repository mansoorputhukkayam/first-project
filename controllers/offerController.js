const Offer = require('../models/offerModel');

const viewOffer = async(req,res) => {
    try {
        const offer = await Offer.find({});
        console.log('its viewing offer');
        res.status(200).render('offer',{offer});
    } catch (error) {
        console.log('viewing offer is error:',error);
    }
}

const getAddOffer = async(req,res) => {
    try {
        console.log('hey ists getAddoffer');
        res.render('addOffer');
    } catch (error) {
        console.log('error for load addOffer:',error);
    }
}

const addOffer = async (req,res) => {
    try {
        console.log('add offfer');
        const {offerName,discountPercentage,offerType,expiryDate} = req.body;
        let newOffer = new Offer({
            offerName:offerName,
            discountPercentage:discountPercentage,
            offerType:offerType,
            expiryDate:expiryDate
        })
        let offerData = await newOffer.save();
        console.log('offerData',offerData);
        res.status(200).json({offerSuccess:true});
    } catch (error) {
        console.log('adding offer error:',error);
        res.status(500).json({offerSuccess:false});
    }
}

const editOffer = async (req,res) => {
    try {
        const offerId = req.params.id;
        console.log('offerId',offerId);
        const offerData = await Offer.find({_id:offerId})
        console.log('offerData',offerData);
        res.render('editOffer',{offerData});
    } catch (error) {
        console.log('edit offer error',error);
    }
}


module.exports = {
    viewOffer,
    addOffer,
    getAddOffer,
    editOffer,

}