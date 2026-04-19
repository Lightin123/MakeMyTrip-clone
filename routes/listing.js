const express = require('express');
const route = express.Router();
const Listing = require('../models/listing.js')
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema} = require('../schema.js');
const Review = require('../models/review.js');

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error);
    }
    next();
}

route.get("/", wrapAsync(async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { listings: allListings });
}));
//Create routeroute
route.get("/new", (req, res) => {
    res.render("listings/new.ejs");
})
route.post("/", validateListing, wrapAsync(async (req, res) => {
    let list = new Listing(req.body.listing);

    if (!list) {
        throw new ExpressError(400, "No Listing was found");
    }
    await list.save();
    res.redirect("/listings");
}));

//Update routes
route.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params
    let list = await Listing.findById(id);
    res.render("listings/edit.ejs", { list });
}));

route.put("/:id", wrapAsync(async (req, res) => {
    await Listing.findByIdAndUpdate(req.params.id, req.body.listing);
    res.redirect(`/listings/${req.params.id}`);
}))

//show route 
route.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let list = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { list });
}));
route.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect(`/listings`);
}));

module.exports = route;