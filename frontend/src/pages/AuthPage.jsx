import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./AuthPage.css";
import LanguageSelector from "../components/LanguageSelector";

const API = "http://localhost:4000";

const translations = {
    ro: {
        loginTitle: "Bine ai revenit",
        registerTitle: "Creează un cont",
        loginSubtitle: "Introdu datele asociate contului tău CashFlow",
        registerSubtitle: "Completează datele pentru a crea un cont nou",
        name: "Nume complet",
        email: "E-mail",
        password: "Parolă",
        continue: "Continuă",
        create: "Creează cont",
        loadingLogin: "Se conectează...",
        loadingRegister: "Se creează...",
        forgot: "Ți-ai uitat parola?",
        divider: "sau continuă cu",
        noAccount: "Nu ai cont?",
        haveAccount: "Ai deja cont?",
        createAccount: "Creează un cont",
        loginAccount: "Intră în cont",
        privacy: "Politica privind confidențialitatea",
        complete: "Completează toate câmpurile.",
    },
    en: {
        loginTitle: "Welcome back",
        registerTitle: "Create account",
        loginSubtitle: "Enter the details associated with your CashFlow account",
        registerSubtitle: "Fill in your details to create a new account",
        name: "Full name",
        email: "E-mail",
        password: "Password",
        continue: "Continue",
        create: "Create account",
        loadingLogin: "Logging in...",
        loadingRegister: "Creating...",
        forgot: "Forgot password?",
        divider: "or continue with",
        noAccount: "Don't have an account?",
        haveAccount: "Already have an account?",
        createAccount: "Create account",
        loginAccount: "Login",
        privacy: "Privacy policy",
        complete: "Complete all fields.",
    },
};

function AuthPage() {
    const [searchParams] = useSearchParams();

    const [isLogin, setIsLogin] = useState(
        searchParams.get("mode") !== "register"
    );

    const [lang, setLang] = useState(localStorage.getItem("lang") || "ro");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const t = translations[lang];

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        localStorage.setItem("lang", lang);
    }, [lang]);

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const switchMode = (loginMode) => {
        setError("");
        setShowPassword(false);
        setIsLogin(loginMode);
    };

    const handleForgotPassword = () => {
        alert(
            lang === "ro"
                ? "Funcția de recuperare a parolei va fi adăugată ulterior."
                : "Password recovery will be added later."
        );
    };

    const handleGoogleLogin = () => {
        window.location.href = `${API}/auth/google`;
    };

    const handleFacebookLogin = () => {
        window.location.href = `${API}/auth/facebook`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (
            !form.email.trim() ||
            !form.password.trim() ||
            (!isLogin && !form.name.trim())
        ) {
            setError(t.complete);
            return;
        }

        try {
            setLoading(true);

            const endpoint = isLogin ? "/auth/login" : "/auth/register";

            const payload = isLogin
                ? {
                    email: form.email.trim(),
                    password: form.password.trim(),
                }
                : {
                    name: form.name.trim(),
                    email: form.email.trim(),
                    password: form.password.trim(),
                };

            const res = await fetch(`${API}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "A apărut o eroare");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            window.location.href = "/";
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="revolut-auth-page">
            <header className="revolut-auth-header">
                <button
                    className="revolut-logo"
                    onClick={() => (window.location.href = "/welcome")}
                    type="button"
                >
                    CashFlow
                </button>

                <LanguageSelector lang={lang} setLang={setLang} />
            </header>

            <main className="revolut-auth-main">
                <section className="revolut-auth-card no-qr">
                    <div className="revolut-form-side">
                        <h1>{isLogin ? t.loginTitle : t.registerTitle}</h1>

                        <p className="revolut-subtitle">
                            {isLogin ? t.loginSubtitle : t.registerSubtitle}
                        </p>

                        {error && <div className="revolut-error">{error}</div>}

                        <form onSubmit={handleSubmit} className="revolut-form">
                            {!isLogin && (
                                <input
                                    type="text"
                                    name="name"
                                    placeholder={t.name}
                                    value={form.name}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            )}

                            <input
                                type="email"
                                name="email"
                                placeholder={t.email}
                                value={form.email}
                                onChange={handleChange}
                                disabled={loading}
                            />

                            <div
                                className={
                                    form.password.length > 0
                                        ? "revolut-password-wrapper has-value"
                                        : "revolut-password-wrapper"
                                }
                            >
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder={t.password}
                                    value={form.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    className="eye-btn-inside"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    disabled={loading || form.password.length === 0}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                                            <path
                                                d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12a18.45 18.45 0 0 1 5.06-6.94"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                            <path
                                                d="M9.9 4.24A10.69 10.69 0 0 1 12 4c5 0 9.27 3.11 11 8a18.5 18.5 0 0 1-2.16 3.19"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                            <path
                                                d="M14.12 14.12A3 3 0 0 1 9.88 9.88"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                            <path
                                                d="M1 1l22 22"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                                            <path
                                                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            />
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="3"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            <button className="revolut-submit" type="submit" disabled={loading}>
                                {loading
                                    ? isLogin
                                        ? t.loadingLogin
                                        : t.loadingRegister
                                    : isLogin
                                        ? t.continue
                                        : t.create}
                            </button>
                        </form>

                        {isLogin && (
                            <button
                                className="forgot-password-btn"
                                type="button"
                                onClick={handleForgotPassword}
                            >
                                {t.forgot}
                            </button>
                        )}

                        <div className="revolut-divider">
                            <span></span>
                            <p>{t.divider}</p>
                            <span></span>
                        </div>

                        <div className="revolut-socials">
                            <button type="button">
                                <span>✉️</span>
                                E-mail
                            </button>

                            <button type="button" onClick={handleGoogleLogin}>
                                <span>G</span>
                                Google
                            </button>

                            <button type="button" onClick={handleFacebookLogin}>
                                <span>f</span>
                                Facebook
                            </button>
                        </div>

                        <div className="revolut-switch">
                            <small>{isLogin ? t.noAccount : t.haveAccount}</small>

                            <button type="button" onClick={() => switchMode(!isLogin)}>
                                {isLogin ? t.createAccount : t.loginAccount}
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="revolut-auth-footer">
                <button
                    type="button"
                    onClick={() => (window.location.href = "/privacy")}
                >
                    {t.privacy}
                </button>
            </footer>
        </div>
    );
}

export default AuthPage;