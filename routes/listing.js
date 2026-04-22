const express = require('express');
const route = express.Router();
const Listing = require('../models/listing.js')
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema } = require('../schema.js');
const Review = require('../models/review.js');
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");



route.get("/", wrapAsync(async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { listings: allListings });
}));
//Create route
route.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
})
route.post("/", isLoggedIn, validateListing, wrapAsync(async (req, res) => {
    let list = new Listing(req.body.listing);
    list.owner = req.user._id;
    if (!list) {
        throw new ExpressError(400, "No Listing was found");
    }
    await list.save();
    req.flash("success", "New listing was created");
    res.redirect("/listings");
}));

//Update routes
route.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params
    let list = await Listing.findById(id);
    if (!list) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { list });
}));

route.put("/:id",isLoggedIn,isOwner, validateListing, wrapAsync(async (req, res) => {
    await Listing.findByIdAndUpdate(req.params.id, req.body.listing);
    res.redirect(`/listings/${req.params.id}`);
}))

//show route 
route.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let list = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            },
        })
        .populate("owner");
    if (!list) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { list });
}));
route.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");
    return res.redirect(`/listings`);
}));

module.exports = route;