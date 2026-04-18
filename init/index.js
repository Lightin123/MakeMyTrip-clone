let mongoose = require('mongoose');
let initData = require("./data.js");
let Listing = require('../models/listing.js');

main().then((res)=>{
    console.log(res);
}).catch((err)=>{
    console.log(err);
});
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
let initDb = async ()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("Initialised succesfully");
}
initDb();