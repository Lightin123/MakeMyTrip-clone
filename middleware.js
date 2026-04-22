const Listing = require("./models/listing");

module.exports.isLoggedIn = (req,res,next)=>{
    req.session.redirectUrl = req.originalUrl;
    if(!req.isAuthenticated()){
        req.flash("error","You must be logged in");
        return res.redirect("/login");
    }
    next();
}

module.exports.redirectUrl = (req,res,next)=>{
    res.locals.redirectUrl = req.session.redirectUrl;
    next()
}

module.exports.isOwner = async(req,res,next)=>{
    let { id } = req.params
    let list = await Listing.findById(id);

    if(!res.locals.currUser._id.equals(list.owner._id)){
        req.flash("error","This listing does not belong to you");
        return res.redirect(`/listings/${id}`);
    }
    next();
}