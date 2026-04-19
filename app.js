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


app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.engine("ejs", ejsMate);

main().then((res) => {
    console.log("Connected Succesfully");
}).catch((err) => {
    console.log(err);
})

//Database Creation
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
}


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
