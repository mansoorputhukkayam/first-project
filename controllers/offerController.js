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

const updateOffer = async (req,res) =>{
    try {
        // console.log('update stated');
        const offerId = req.body.id;
        const {offerName,discountPercentage,offerType,expiryDate} = req.body;

        const newOffer = await Offer.findByIdAndUpdate(offerId,{offerName,discountPercentage,offerType,expiryDate},{new:true});
        console.log('update Success',newOffer);
        res.status(200).json({updateSuccess:true});

    } catch (error) {
        console.log('updating offer:',error);
    }
}

const deleteOffer = async (req,res) =>{
    try {
        console.log('delter offer');
        const offerId = req.params.id;
        const deleteData = await Offer.deleteOne({_id:offerId});
        res.status(200).json({deleteOffer:true});
    } catch (error) {
        console.log('offer deleting error:',error);
        res.status(500).json({deleteOffer:false});
    }
}


module.exports = {
    viewOffer,
    addOffer,
    getAddOffer,
    editOffer,
    updateOffer,
    deleteOffer
}