const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const eventSchema = new Schema({
    title: String,
    description: String,
    creator: {
        // to connect a schema from  an other document
        type: Schema.Types.ObjectId,
        // so this is the part connecting to the authors collection
        ref: 'User.model'
    },
    location: String,
    startTime: Date,
    endTime: Date
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;