const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const userSchema = new mongoose.Schema({
    slack_id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    team: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);