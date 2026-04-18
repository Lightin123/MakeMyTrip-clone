const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const PORT = 8080;
const Listing = require('./models/listing.js')
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const {listingSchema} = require('./schema.js');

app.set("views",path.join(__dirname,"/views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride('_method'));
app.engine("ejs",ejsMate);

main().then((res)=>{
    console.log("Connected Succesfully");
}).catch((err)=>{
    console.log(err);
})

const validate = (req,res,next)=>{
    const {err} = listingSchema.validate(req.body)
    if(err){
        throw new ExpressError(400,err);
    }
    next();
}

//Database Creation
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
}


app.get("/",(req,res)=>{
    res.send("Working");
    console.log("Index route");
});

//listings
app.get("/listings",wrapAsync(async(req,res)=>{
    let allListings = await Listing.find({});
    res.render("listings/index.ejs",{listings : allListings});
}));
//Create routes
app.get("/listings/new",validate,(req,res)=>{
    res.render("listings/new.ejs");
})
app.post("/listings",wrapAsync(async(req,res)=>{
    let list = new Listing(req.body);
    let result = listingSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(400,result.error);
    }
    if(!list){
        throw new ExpressError(400,"No Listing was found");
    }
    await list.save();
    res.redirect("/listings");
}));

//Update routes
app.get("/listings/:id/edit",validate,wrapAsync(async (req,res)=>{
    let {id} = req.params
    let list = await Listing.findById(id);
    res.render("listings/edit.ejs",{list});
    console.log(list);
}));

app.put("/listings/:id",async(req,res)=>{
    await Listing.findByIdAndUpdate(req.params.id,req.body);
    res.redirect(`/listings/${req.params.id}`);
})

//show route 
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let list= await Listing.findById(id);
    res.render("listings/show.ejs",{list});
}));
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect(`/listings`);
}));


//Error Handling
app.use((req,res,next)=>{
    next(new ExpressError(404,"Page not found"))
})

app.use((err,req,res,next)=>{
    let {status=500,message} = err;
    res.render("listings/error.ejs",{message})
    res.status(status)
})

app.listen(PORT,()=>{
    console.log(`Litsening on Port ${PORT}`);
});
