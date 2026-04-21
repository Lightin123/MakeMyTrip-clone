const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const PORT = 8080;
const ExpressError = require('./utils/ExpressError.js');
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const session = require('express-session');
const flash = require('connect-flash');

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

main().then((res) => {
    console.log("Connected Succesfully");
}).catch((err) => {
    console.log(err);
})

//Database Creation
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
}

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next()
});

app.get("/", (req, res) => {
    res.send("Working");
    console.log("Index route");
});


//listings
app.use("/listings", listings);

//reviews
app.use("/listings/:id", reviews)

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
