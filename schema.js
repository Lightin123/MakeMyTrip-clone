const Joi = require('joi');
module.exports.listingSchema = Joi.object({
    listing : Joi.object({
        title : Joi.string().required(),
        description : Joi.string().required(),
        location : Joi.string().required(),
        country : Joi.string().required(),
        price : Joi.number().required().min(0),
        totalRooms : Joi.number().required().min(1),
        image : Joi.string().allow("",null)
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review : Joi.object({
        comment : Joi.string().required(),
        rating : Joi.number().required().min(1).max(5)
    }).required()
});

module.exports.bookingSchema = Joi.object({
    booking : Joi.object({
        rooms : Joi.number().required().min(1),
        date : Joi.string().required(),
        startDate : Joi.string().required(),
        endDate : Joi.string().required(),
        guests : Joi.number().required().min(1)
    }).required()
});