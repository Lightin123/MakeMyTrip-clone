const express = require('express');
const route = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const User = require("../models/user.js");
const Booking = require("../models/booking.js");
const passport = require("passport");
const { redirectUrl,isLoggedIn } = require("../middleware.js")
const userController = require("../controllers/users.js");
route.get("/signup",userController.renderSignUp )

route.get('/bookings', isLoggedIn, async(req,res)=>{
    let id = req.user._id;
    let bookingHistory = await Booking.find({user : id}).populate("listing");
    res.render('bookings/history.ejs',{bookingHistory})
})

route.post("/signup",userController.filledSignUp)

route.get("/login", userController.renderLogin)

route.post("/login", redirectUrl, passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),userController.filledLogin )

route.get("/logout", userController.logout)

module.exports = route;