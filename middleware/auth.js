// middleware/auth.js
exports.isAdmin = (req, res, next) => {
    // ВАЖНО: проверяем именно флаг isAdmin, который должен ставиться при входе
    if (req.session && req.session.isAdmin === true) {
        return next();
    }
    
    // Если мы здесь, значит доступа нет. ОСТАНАВЛИВАЕМ запрос.
    console.log("Попытка несанкционированного входа!");
    res.status(403).send(`
        <div style="text-align:center; margin-top:100px; font-family: sans-serif;">
            <h1 style="color:red;">ДОСТУП ЗАПРЕЩЕН</h1>
            <p>У вас нет прав администратора для просмотра этой страницы.</p>
            <a href="/">Вернуться на главную</a>
        </div>
    `);
};