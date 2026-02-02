const Application = require('../models/Application');

exports.submitApplication = async (req, res) => {
    try {
        // Проверяем наличие файлов, чтобы не упасть с ошибкой
        const paths = req.files ? req.files.map(file => '/uploads/' + file.filename) : [];
        
        const newApp = new Application({
            fullName: req.body.fullName,
            direction: req.body.direction,
            recordBook: req.body.recordBook,
            comments: req.body.comments,
            certificates: paths,
            status: 'pending',
            totalPoints: 0 
        });

        await newApp.save(); // Сохраняем в коллекцию Application
        res.redirect('/?success=1'); 
    } catch (error) {
        console.error("Ошибка подачи заявки:", error);
        res.redirect('/?error=1');
    }
};