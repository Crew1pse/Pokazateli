require('dotenv').config();

const express = require("express");
const mongoose = require('mongoose');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const session = require('express-session');
const path = require('path');
const hbs = require('hbs');

const publicRoutes = require('./routes/publicRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const port = 3000;

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(session({
    secret: 'secret-key-ist',
    resave: false,
    saveUninitialized: true
}));

app.use('/', publicRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

const dbUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/iststipuha';
mongoose.connect(dbUrl);
const upload = multer({ dest: 'public/uploads/' });

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});