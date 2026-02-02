const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    studentName: String,
    recordBook: String,
    direction: String,
    // Направления
    u_score: { type: Number, default: 0 }, // Учебная
    n_score: { type: Number, default: 0 }, // Научная
    o_score: { type: Number, default: 0 }, // Общественная
    k_score: { type: Number, default: 0 }, // Культурно-творческая
    s_score: { type: Number, default: 0 }, // Спортивная
    // Та самая 6-я сумма
    totalScore: { type: Number, default: 0 }
});

module.exports = mongoose.model('Rating', ratingSchema);