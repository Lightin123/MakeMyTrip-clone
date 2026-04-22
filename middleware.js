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