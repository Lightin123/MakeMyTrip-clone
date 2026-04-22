const express = require('express');
const route = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const User = require("../models/user.js");
const passport = require("passport");

route.get("/signup",(req,res)=>{
    res.render("users/signup.ejs")
})

route.post("/signup",async(req,res)=>{
    try{
    let {username,email,password} = req.body;
    let newUser = new User({email,username});
    const registeredUser = await User.register(newUser,password);
    console.log(registeredUser);
    req.flash("success","Welcome to MakeMyTrip");
    res.redirect("/listings");
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signup")
    }

})

route.get("/login",(req,res)=>{
    res.render("users/login.ejs");
})

route.post("/login",passport.authenticate('local', { failureRedirect: '/login',failureFlash :true }),async(req,res)=>{
    req.flash("success","Welcome to MakeMyTrip");
    res.redirect("/listings");
})

module.exports = route