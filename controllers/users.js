const User = require("../models/user")

module.exports.renderSignUp =(req, res) => {
    res.render("users/signup.ejs");
}
module.exports.filledSignUp = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        let newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err)
            }
            req.flash("success", "Welcome to MakeMyTrip");
            res.redirect("/listings");
        })
    }
    catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup")
    }

}

module.exports.renderLogin = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.filledLogin = async (req, res) => {
    req.flash("success", "Welcome to MakeMyTrip");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You have successfully logged out");
        res.redirect("/listings");
    });
}