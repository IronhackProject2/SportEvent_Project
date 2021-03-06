const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const eventSchema = new Schema({
    title: String,
    description: String,
    location: String,
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    coordinates: {
        latitude: Number,
        longitude: Number,
    },
    address: {
        houseNumber: Number,
        street: String,
        city: String,
        postcode:Number,
        country: String
    },
    timeAndDate: {
        starting: Date,
        ending: Date,
    },
    sports: String
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;