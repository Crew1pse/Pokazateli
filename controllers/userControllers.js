const User = require('../models/User');
const Application = require('../models/Application');
const Rating = require('../models/Rating');

exports.getRatingTable = async (req, res) => {
    try {
        const contestants = await Rating.find().sort({ totalScore: -1 }).lean();
        const ratedContestants = contestants.map((item, index) => ({
            ...item,
            rank: index + 1,
            isWinner: index < 5 
        }));

        res.render("table", { 
            contestants: ratedContestants,
            user: req.session.userId || null,
            isAdmin: req.session.isAdmin || false
        });
    } catch (error) {
        res.status(500).send("Ошибка загрузки таблицы");
    }
};

exports.getProfile = async (req, res) => {
    if (!req.session.userId) return res.redirect("/login");
    try {
        const user = await User.findById(req.session.userId).lean();
        const userRating = await Rating.findOne({ recordBook: user.recordBook }).lean();
        const myApplications = await Application.find({ recordBook: user.recordBook }).lean();
        
        res.render("profile", { 
            user, 
            rating: userRating, 
            applications: myApplications 
        });
    } catch (err) {
        res.status(500).send("Ошибка доступа к профилю");
    }
};

exports.submitApplication = async (req, res) => {
    try {
        const paths = req.files.map(file => '/uploads/' + file.filename);
        const newApp = new Application({
            fullName: req.body.fullName,
            direction: req.body.direction,
            recordBook: req.body.recordBook,
            comments: req.body.comments,
            certificates: paths,
            status: 'pending'
        });
        await newApp.save();
        res.redirect('/?success=1'); 
    } catch (error) {
        res.redirect('/?error=1');
    }
};