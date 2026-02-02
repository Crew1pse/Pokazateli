const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    fullName: String,
    recordBook: String,
    direction: String,
    comments: String,
    certificates: [String],
    status: { type: String, default: 'pending' },
    totalPoints: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);