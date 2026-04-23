if(process.env.NODE_ENV != "production"){
    require("dotenv").config()
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const PORT = 8080;
const ExpressError = require('./utils/ExpressError.js');
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require('./routes/user.js');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStratergy = require('passport-local');
const User = require('./models/user.js');

const sessionOptions = {
    secret: "secretcode",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.engine("ejs", ejsMate);
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

main().then((res) => {
    console.log("Connected Succesfully");
}).catch((err) => {
    console.log(err);
})

//Database Creation
async function main() {
    await mongoose.connect(process.env.MONGODB_CONNECTION)
}

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next()
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          

app.get("/", (req, res) => {
    res.send("Working");
    console.log("Index route");
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUSer = new User({
//         email : "student@gmail.com",
//         username : "test-student",
//     })
//     let registeredUSer = await User.register(fakeUSer,"password");
//     res.send(registeredUSer);
// })

app.use("/",userRouter);

//listings
app.use("/listings", listingRouter);

//reviews
app.use("/listings/:id", reviewRouter)

//Error Handling
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"))
})

app.use((err, req, res, next) => {
    let { status = 500, message } = err;
    res.status(status).render("listings/error.ejs", { message });
})

app.listen(PORT, () => {
    console.log(`Litsening on Port ${PORT}`);
});
