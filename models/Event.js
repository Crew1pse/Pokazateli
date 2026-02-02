const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: String,
    category: String,
    points: Number
});

module.exports = mongoose.model('Event', eventSchema);