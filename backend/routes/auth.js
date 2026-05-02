const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

function createToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

function redirectWithToken(res, user) {
    const token = createToken(user);

    const userData = encodeURIComponent(
        JSON.stringify({
            id: user._id,
            name: user.name,
            email: user.email,
        })
    );

    res.redirect(`${FRONTEND_URL}/oauth-success?token=${token}&user=${userData}`);
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: `${BACKEND_URL}/auth/google/callback`,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value?.toLowerCase();

                    if (!email) {
                        return done(null, false);
                    }

                    let user = await User.findOne({ email });

                    if (!user) {
                        user = await User.create({
                            name: profile.displayName || "Google User",
                            email,
                            provider: "google",
                            providerId: profile.id,
                            password: "",
                        });
                    }

                    return done(null, user);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
        new FacebookStrategy(
            {
                clientID: process.env.FACEBOOK_APP_ID,
                clientSecret: process.env.FACEBOOK_APP_SECRET,
                callbackURL: `${BACKEND_URL}/auth/facebook/callback`,
                profileFields: ["id", "displayName", "emails"],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value?.toLowerCase();

                    if (!email) {
                        return done(null, false);
                    }

                    let user = await User.findOne({ email });

                    if (!user) {
                        user = await User.create({
                            name: profile.displayName || "Facebook User",
                            email,
                            provider: "facebook",
                            providerId: profile.id,
                            password: "",
                        });
                    }

                    return done(null, user);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );
}

router.post("/register", async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Completează toate câmpurile" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Parola trebuie să aibă minim 6 caractere" });
        }

        if (confirmPassword !== undefined && password !== confirmPassword) {
            return res.status(400).json({ error: "Parolele nu se potrivesc" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ error: "Email-ul există deja" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            provider: "local",
        });

        const token = createToken(user);

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

        if (!email || !password) {
            return res.status(400).json({ error: "Completează email-ul și parola" });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user || !user.password) {
            return res.status(400).json({ error: "Email sau parolă greșită" });
        }

        const ok = await bcrypt.compare(password, user.password);

        if (!ok) {
            return res.status(400).json({ error: "Email sau parolă greșită" });
        }

        const token = createToken(user);

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

router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
}));

router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${FRONTEND_URL}/auth?error=google`,
    }),
    (req, res) => redirectWithToken(res, req.user)
);

router.get("/facebook", passport.authenticate("facebook", {
    scope: ["email"],
    session: false,
}));

router.get(
    "/facebook/callback",
    passport.authenticate("facebook", {
        session: false,
        failureRedirect: `${FRONTEND_URL}/auth?error=facebook`,
    }),
    (req, res) => redirectWithToken(res, req.user)
);

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

        const token = createToken(updatedUser);

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
            return res.status(400).json({ error: "Noua parolă trebuie să aibă minim 6 caractere" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: "Parolele noi nu se potrivesc" });
        }

        const user = await User.findById(req.user.id);

        if (!user || !user.password) {
            return res.status(400).json({ error: "Acest cont nu are parolă locală" });
        }

        const ok = await bcrypt.compare(currentPassword, user.password);

        if (!ok) {
            return res.status(400).json({ error: "Parola curentă este greșită" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: "Parola a fost schimbată cu succes" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;