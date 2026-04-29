const crypto = require("crypto");
const express = require('express');
const route = express.Router();
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const Razorpay = require("razorpay");
const { isLoggedIn, isOwner, validateListing, validateBooking } = require("../middleware.js");

route.get('/:id', isLoggedIn, async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
    if(!listing){
        req.flash("error","Listing does not exist");
        return res.redirect('/listings');
    }
    let bookings = await Booking.find({ listing: id });
    res.render("bookings/booking.ejs", { id, bookings, totalRooms: listing.totalRooms })
})

route.post("/:id/pay", isLoggedIn, validateBooking, async (req, res) => {
    try {
        let { id } = req.params;
        let listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        const totalRooms = listing.totalRooms || 1;
        let { startDate, endDate, rooms } = req.body.booking;
        const requestedRooms = parseInt(rooms);
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        if (startDate.getTime() === endDate.getTime()) {
            req.flash("error", "You must book at least 1 night");
            return res.redirect(`/booking/${id}`);
        }
        const bookings = await Booking.find({
            listing: id,
            startDate: { $lt: endDate },
            endDate: { $gt: startDate }
        }).select("startDate endDate rooms");
        let currentDay = new Date(startDate);
        while (currentDay < endDate) {
            let roomsUsed = 0;
            bookings.forEach(b => {
                if (b.startDate <= currentDay && currentDay < b.endDate) {
                    roomsUsed += b.rooms;
                }
            });
            if (roomsUsed + requestedRooms > totalRooms) {
                req.flash("error", "Selected dates not available");
                return res.redirect(`/booking/${id}`);
            }
            currentDay = new Date(currentDay.getTime() + 24 * 60 * 60 * 1000); // Safely add 1 day
        }
        req.session.bookingData = req.body.booking;

        req.session.save(() => {
            res.redirect(`/booking/${id}/pay`);
        });

    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong");
        res.redirect(`/booking/${req.params.id}`);
    }
});

route.get("/:id/pay", isLoggedIn, async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    let listPrice = listing.price;
    let bookingData = req.session.bookingData;
    
    if (!bookingData) {
        req.flash("error", "Your session expired. Please submit the booking form again.");
        return res.redirect(`/booking/${id}`);
    }

    let days = Math.max(1, (new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24));
    let totalPrice = days * bookingData.rooms * listPrice * 1.18;
    res.render("bookings/bill", { id, listPrice, bookingData, totalPrice, days, razorpayKey: process.env.RAZORPAY_KEY_ID });
})

route.post("/:id/create-order",isLoggedIn, async (req, res) => {
    let { id } = req.params;

    // get booking data from session
    let bookingData = req.session.bookingData;

    let listing = await Listing.findById(id);
    let days = Math.max(1, (new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24));
    let amount = days * bookingData.rooms * listing.price * 1.18; // Includes 18% tax

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // convert to paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`
    });

    res.json(order);
});




route.post("/:id/verify", isLoggedIn, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        let bookingData = req.session.bookingData;

        await Booking.create({
            listing: req.params.id,
            user: req.user._id,
            ...bookingData
        });

        req.session.bookingData = null;
        req.session.paymentSuccess = true;

        res.json({ success: true });
    } else {
        res.status(400).json({ success: false });
    }
});

route.get("/:id/success",isLoggedIn, async (req, res) => {
    if(req.session.paymentSuccess === true){
        let { id } = req.params;
        let listing = await Listing.findById(id);
        req.session.paymentSuccess = false;
        res.render("bookings/success.ejs", { listing });
    }
    else{
        req.flash("error","Invalid request");
        res.redirect('/listings');
    }
});

module.exports = route;