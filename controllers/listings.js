const Listing = require("../models/listing");
const ExpressError = require('../utils/ExpressError.js');
const axios = require('axios');

module.exports.index = async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { listings: allListings });
}

module.exports.renderNewListing = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.createNewListing = async (req, res) => {
    let url = req.file?.path || "https://res.cloudinary.com/dxysjibir/image/upload/v1700000000/Airbnb/default_image.jpg";
    let filename = req.file?.filename || "default";
    let list = new Listing(req.body.listing);
    list.owner = req.user._id;
    if (!list) {
        throw new ExpressError(400, "No Listing was found");
    }
    const query = req.body.listing.location;
    const link = `https://nominatim.openstreetmap.org/search?q=${query}&format=json`;
    try{
    const response = await axios.get(link, {
        headers: { 'User-Agent': 'MyNodeApp/1.0' }
    });
    if (response.data.length > 0) {
        let { lat, lon } = response.data[0];
        console.log(lat,lon);
        list.geometry = {
        type: "Point",
        coordinates: [parseFloat(lon), parseFloat(lat)]
    };
    }
    list.image = { url, filename };
    await list.save();
    req.flash("success", "New listing was created");
    res.redirect("/listings");
}
catch(e){
    throw new ExpressError(400,"Could not get the cordinates of the listing")
}
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
    if (typeof req.file !== "undefined") {
        req.body.listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }
    const query = req.body.listing.location;
    const link = `https://nominatim.openstreetmap.org/search?q=${query}&format=json`;
    try{
    const response = await axios.get(link, {
        headers: { 'User-Agent': 'MyNodeApp/1.0' }
    });
    if (response.data.length > 0) {
        let { lat, lon } = response.data[0];
        console.log(lat,lon);
        req.body.listing.geometry = {
        type: "Point",
        coordinates: [parseFloat(lon), parseFloat(lat)]
    };
    }
    await Listing.findByIdAndUpdate(req.params.id, req.body.listing);
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${req.params.id}`);
    }
    catch(e){
        throw new ExpressError(400,"Could not get the cordinates of the listing")
    }
    
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
    res.render("listings/show.ejs", { list,GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,lat:list.geometry.coordinates[1],lon:list.geometry.coordinates[0] });
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");
    return res.redirect(`/listings`);
};