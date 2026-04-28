const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const Review = require('./review.js')

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
       url:{
        type:String
       },
       filename:{
        type:String
       }
    },
    price: Number,
    location: String,
    country: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }],
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    geometry: {
        type: {
            type: String, // Don't do 'location: String' here
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number], // Array of numbers: [longitude, latitude]
            required: true
        }
    }
});
listingSchema.index({ geometry: "2dsphere" });
listingSchema.post("findOneAndDelete", async (listings) => {
    if (listings) {
        await Review.deleteMany({ _id: { $in: listings.reviews } })
    }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;