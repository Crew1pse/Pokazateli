const User = require('../models/User');

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@mail.ru' && password === '12345') {
        req.session.isAdmin = true;
        return res.json({ success: true, redirect: '/admin' });
    }
    const user = await User.findOne({ login: email, password });
    if (user) {
        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.isAdmin = false;
        return res.json({ success: true, redirect: '/profile' });
    }
    res.status(401).json({ success: false, message: "Неверные данные" });
};

exports.register = async (req, res) => {
    try {
        const { login, username, password, confirmPassword } = req.body;
        if (password !== confirmPassword) return res.status(400).send("Пароли не совпадают!");
        const newUser = new User({ login, username, password });
        await newUser.save();
        res.redirect("/login");
    } catch (err) {
        res.status(500).send("Ошибка регистрации");
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};