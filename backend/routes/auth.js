const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Completează toate câmpurile" });
        }

        if (password.length < 6) {
            return res
                .status(400)
                .json({ error: "Parola trebuie să aibă minim 6 caractere" });
        }

        if (confirmPassword !== undefined && password !== confirmPassword) {
            return res.status(400).json({ error: "Parolele nu se potrivesc" });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: "Email-ul există deja" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
        });

        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(400).json({ error: "Email sau parolă greșită" });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return res.status(400).json({ error: "Email sau parolă greșită" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ error: "Utilizatorul nu a fost găsit" });
        }

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put("/profile", auth, async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: "Completează numele și email-ul" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: req.user.id },
        });

        if (existingUser) {
            return res.status(400).json({ error: "Email-ul este deja folosit" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                name: name.trim(),
                email: normalizedEmail,
            },
            { new: true }
        ).select("-password");

        const token = jwt.sign(
            {
                id: updatedUser._id,
                email: updatedUser.email,
                name: updatedUser.name,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Profil actualizat cu succes",
            token,
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                createdAt: updatedUser.createdAt,
            },
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put("/change-password", auth, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: "Completează toate câmpurile" });
        }

        if (newPassword.length < 6) {
            return res
                .status(400)
                .json({ error: "Noua parolă trebuie să aibă minim 6 caractere" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: "Parolele noi nu se potrivesc" });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "Utilizatorul nu a fost găsit" });
        }

        const ok = await bcrypt.compare(currentPassword, user.password);
        if (!ok) {
            return res.status(400).json({ error: "Parola curentă este greșită" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        res.json({ message: "Parola a fost schimbată cu succes" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;