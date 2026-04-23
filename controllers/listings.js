const Listing = require("../models/listing");
const ExpressError = require('../utils/ExpressError.js');

module.exports.index = async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { listings: allListings });
}

module.exports.renderNewListing = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.createNewListing = async (req, res) => {
    let list = new Listing(req.body.listing);
    list.owner = req.user._id;
    if (!list) {
        throw new ExpressError(400, "No Listing was found");
    }
    await list.save();
    req.flash("success", "New listing was created");
    res.redirect("/listings");
}

module.exports.renderEditListing = async (req, res) => {
    let { id } = req.params
    let list = await Listing.findById(id);
    if (!list) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { list });
};

module.exports.updateListing = async (req, res) => {
    await Listing.findByIdAndUpdate(req.params.id, req.body.listing);
    res.redirect(`/listings/${req.params.id}`);
};

module.exports.showListing = async (req, res) => {
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
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");
    return res.redirect(`/listings`);
};