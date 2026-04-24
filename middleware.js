const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema} = require('./schema.js');
const {reviewSchema } = require('./schema.js');

module.exports.isLoggedIn = (req,res,next)=>{
    req.session.redirectUrl = req.originalUrl;
    if(!req.isAuthenticated()){
        req.flash("error","You must be logged in");
        return res.redirect("/login");
    }
    next();
}

module.exports.redirectUrl = (req,res,next)=>{
    res.locals.redirectUrl = req.session.redirectUrl;
    next();
}

module.exports.isOwner = async(req,res,next)=>{
    let { id } = req.params
    let list = await Listing.findById(id);
    if (!list) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    if(!res.locals.currUser._id.equals(list.owner._id)){
        req.flash("error","This listing does not belong to you");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        throw new ExpressError(400, error);
    }
    next();
}

module.exports.isReviewAuthor= async(req,res,next)=>{
    let { id , reviewId} = req.params
    let review = await Review.findById(reviewId);
    if(!review){
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }
    if(!req.user._id.equals(review.author._id)){
        req.flash("error","This Review does not belong to you");
        return res.redirect(`/listings/${id}`);
    }
    next();
}