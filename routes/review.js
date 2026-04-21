const express = require('express');
const router = express.Router({mergeParams : true});
const Listing = require('../models/listing.js')
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const {reviewSchema } = require('../schema.js');
const Review = require('../models/review.js');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        throw new ExpressError(400, error);
    }
    next()
}

router.post("/reviews", validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","New Review was created");
    res.redirect(`/listings/${req.params.id}`);
}))

//Delete
router.delete("/reviews/:reviewId",wrapAsync(async(req,res)=>{
    let {id ,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull :{reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Reviwew deelted");
    res.redirect(`/listings/${req.params.id}`);
}))
module.exports=router
