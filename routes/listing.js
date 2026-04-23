const express = require('express');
const route = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

route.get("/", wrapAsync(listingController.index));
//Create route
route.get("/new", isLoggedIn, listingController.renderNewListing)

route.post("/",upload.single('listing[image]'), isLoggedIn, validateListing, wrapAsync(listingController.createNewListing));

//Update routes
route.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditListing));

route.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

//show route 
route.get("/:id", wrapAsync(listingController.showListing));

route.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

module.exports = route;