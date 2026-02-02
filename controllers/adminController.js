const Tesseract = require('tesseract.js');
const path = require('path');
const Event = require('../models/Event');
const Application = require('../models/Application');
const Rating = require('../models/Rating'); 

// 1. Отображение дашборда
exports.getDashboard = async (req, res) => {
    try {
        const [pendingApps, allEvents] = await Promise.all([
            Application.find({ status: 'pending' }),
            Event.find() // Подгружаем все мероприятия
        ]);
        
        res.render('admin', {
            apps: pendingApps,
            events: allEvents,
            isAdmin: req.session.isAdmin
        });
    } catch (err) {
        res.status(500).send("Ошибка загрузки данных");
    }
};

// 2. Одобрение заявки (Синхронизировано с именами в Rating.js)
exports.approveApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { scores } = req.body; // Получаем объект scores из fetch в admin.js

        const application = await Application.findById(id);
        if (!application) return res.status(404).json({ success: false, message: "Заявка не найдена" });

        // Маппинг данных из admin.js в поля модели Rating.js
        await Rating.create({
            studentName: application.fullName,
            recordBook: application.recordBook,
            direction: application.direction,
            u_score: scores.study || 0,    // Учебная
            n_score: scores.science || 0,  // Научная
            o_score: scores.public || 0,   // Общественная
            k_score: scores.culture || 0,  // Культурная
            s_score: scores.sport || 0,    // Спортивная
            totalScore: scores.total || 0  // 6-я сумма
        });

        // Удаление из заявок
        await Application.findByIdAndDelete(id);

        res.json({ success: true, message: "Студент добавлен в рейтинг" });
    } catch (err) {
        console.error('Ошибка сохранения:', err);
        res.status(500).json({ success: false, error: "Ошибка при записи в БД" });
    }
};

// 3. OCR Сканирование
exports.scanCertificate = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application || !application.certificates.length) {
            return res.status(404).json({ error: "Файлы не найдены" });
        }

        const imagePath = path.join(__dirname, '..', 'public', application.certificates[0]);
        const { data: { text } } = await Tesseract.recognize(imagePath, 'rus+eng');
        
        const allEvents = await Event.find();
        // Ищем упоминание названия мероприятия в распознанном тексте
        const detectedEvent = allEvents.find(e => text.toLowerCase().includes(e.name.toLowerCase()));

        res.json({ 
            success: true, 
            detectedEvent: detectedEvent || null,
            text: text.substring(0, 150) // Для отладки
        });
    } catch (err) {
        console.error('OCR Error:', err);
        res.status(500).json({ error: "Ошибка распознавания текста" });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const { name, category, points } = req.body;
        const newEvent = new Event({
            name,
            category,
            points: Number(points)
        });
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при создании мероприятия" });
    }
};

// Удаление мероприятия
exports.deleteEvent = async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Ошибка при удалении" });
    }
};