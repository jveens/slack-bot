const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const instanceSchema = new mongoose.Schema({
    date_start: {
        type: Date,
        required: true
    },
    date_end: {
        type: Date,
        required: true
    },
    creator: {
        type: String,
        required: true
    },
    channel: {
        type: String,
        required: true
    },
    team: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Instance', instanceSchema);