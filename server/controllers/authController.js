const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields must be filled" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Incorrect email format" });
        }

        const candidate = await User.findOne({ email });
        if (candidate) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const activationLink = uuid.v4();

        const user = new User({
            email,
            password: hashedPassword,
            activationLink
        });
        await user.save();

        const activationUrl = `${process.env.CLIENT_URL}/activate/${activationLink}`;

        await transporter.sendMail({
            from: 'admin@resource-center.com',
            to: email,
            subject: 'Sign up completion at resource-center',
            html: `
        <div>
          <h1>Welcome to resource-center!</h1>
          <p>To complete sign up follow the link below:</p>
          <a href="${activationUrl}">Confirm sign up</a> 
        </div>
    `
        });

        return res.status(201).json({ message: "Mail for sign up completion was sent to email" });
    } catch (e) {
        res.status(500).json({ message: e.message || "Error during signup" });
    }
};


const activate = async (req, res) => {
    try {
        const activationLink = req.params.link;

        const user = await User.findOne({ activationLink });

        if (!user) {
            return res.status(400).json({ message: "Некоректне посилання для активації" });
        }

        user.isActivated = true;
        await user.save();

        return res.status(200).json({
            message: "Акаунт успішно активовано!",
            email: user.email
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Помилка при активації" });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Заповніть усі поля" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Користувача з таким email не знайдено" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Невірний пароль" });
        }

        if (!user.isActivated) {
            return res.status(400).json({ message: "Будь ласка, підтвердіть пошту (перейдіть за посиланням у листі)" });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: "Вхід успішний!",
            token,
            user: { id: user._id, email: user.email, role: user.role }
        });

    } catch (e) {
        console.error("Помилка логіну:", e);
        res.status(500).json({ message: "Помилка при вході в систему" });
    }
};

module.exports = { register, activate, login };

