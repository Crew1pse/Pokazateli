const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    fullName: { type: String, required: true },     // ФИО
    direction: { type: String, required: true },    // Направление
    recordBook: { type: String, required: true },   // № зачётки
    comments: String,                               // Комментарий
    certificates: [String],                         // Массив путей к файлам (грамотам)
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending'                          //  в ожидании
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);