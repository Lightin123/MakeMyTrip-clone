const express = require('express');
const route = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const User = require("../models/user.js");
const passport = require("passport");
const { redirectUrl } = require("../middleware.js")
const userController = require("../controllers/users.js");

route.get("/signup",userController.renderSignUp )

route.post("/signup",userController.filledSignUp)

route.get("/login", userController.renderLogin)

route.post("/login", redirectUrl, passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),userController.filledLogin )

route.get("/logout", userController.logout)

module.exports = route;