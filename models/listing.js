const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review.js')

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1774244764160-c6db8d01c4a8?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        set: (v) => v === '' ? "https://images.unsplash.com/photo-1774244764160-c6db8d01c4a8?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" : v,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }]
});
listingSchema.post("findOneAndDelete", async (listings) => {
    if (listings) {
        await Review.deleteMany({ _id: { $in: listings.reviews } })
    }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;