const express = require('express');
const route = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const User = require("../models/user.js");
const passport = require("passport");
const {redirectUrl} = require("../middleware.js")
route.get("/signup",(req,res)=>{
    res.render("users/signup.ejs")
})

route.post("/signup",async(req,res,next)=>{
    try{
    let {username,email,password} = req.body;
    let newUser = new User({email,username});
    const registeredUser = await User.register(newUser,password);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err)
        }
        req.flash("success","Welcome to MakeMyTrip");
        res.redirect("/listings");
    })
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signup")
    }

})

route.get("/login",(req,res)=>{
    res.render("users/login.ejs");
})

route.post("/login",redirectUrl,passport.authenticate('local', { failureRedirect: '/login',failureFlash :true }),async(req,res)=>{
    req.flash("success","Welcome to MakeMyTrip");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
})

route.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You have successfully logged out");
        res.redirect("/listings");
    });
})

module.exports = route;