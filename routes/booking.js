const express = require('express');
const route = express.Router();
const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing, validateBooking } = require("../middleware.js");

route.get('/:id',isLoggedIn, (req,res)=>{
    let {id} = req.params;
    res.render("bookings/booking.ejs",{id})
})

route.post("/:id/pay",isLoggedIn, validateBooking, (req, res) => {
    let { id } = req.params;
    req.session.bookingData = req.body.booking;
    console.log(req.body);
    res.redirect(`/booking/${id}/pay`);
});

route.get("/:id/pay",isLoggedIn,async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    let listPrice = listing.price;
    let bookingData = req.session.bookingData;
    res.render("bookings/bill",{listPrice,bookingData});
})

module.exports = route;