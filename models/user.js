
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose').default;
const userSchema = new Schema({
    email : {
        type: String,
        required : true,
    },
});
userSchema.plugin(passportLocalMongoose);
userSchema.post("findOneAndDelete", async (user) => {
    if (user) {
        await Review.deleteMany({ _id: { $in: listings.reviews } })
    }
});


module.exports = mongoose.model('User', userSchema);