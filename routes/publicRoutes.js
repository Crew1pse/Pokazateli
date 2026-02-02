const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const Event = require('../models/Event');
const applicationController = require('../controllers/applicationController');
const userControllers = require('../controllers/userControllers');
const adminController = require('../controllers/adminController');

const { isAdmin } = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

router.get('/admin', isAdmin, adminController.getDashboard);
router.get("/table", userControllers.getRatingTable);
router.post('/submit-application', upload.array('certificates', 10), applicationController.submitApplication);
router.get('/', (req, res) => {
    res.render("index", { 
        user: req.session.user || null,
        isAdmin: req.session.isAdmin 
    });
});
router.get("/events", async (req, res) => {
    const events = await Event.find();
    res.render("events", { 
        events: events, 
        user: req.session.user || null,
        isAdmin: req.session.isAdmin
    });
});

router.get("/events/delete/:id", async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        // После удаления возвращаем пользователя на страницу мероприятий
        // Страница перезагрузится и покажет только оставшиеся записи
        res.redirect("/events"); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Ошибка при удалении мероприятия");
    }
});

module.exports = router;