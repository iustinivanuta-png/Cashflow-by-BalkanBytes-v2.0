import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WelcomePage.css";
import LanguageSelector from "../components/LanguageSelector";

const translations = {
    en: {
        navFeatures: "",
        navWhy: "",
        login: "Login",
        getStarted: "Get Started",
        day: "Day",
        night: "Night",

        heroTitle: "Control your finances in one place",
        heroText:
            "CashFlow helps you track income, expenses, savings and financial statistics through a modern and intuitive interface.",
        heroButton: "Get started",
        

        previewBalance: "Current Balance",
        previewTransactions: "Latest transactions",
        previewIncome: "Salary",
        previewFood: "Food",
        previewEntertainment: "Entertainment",

        featuresTitle: "Main features",
        featuresSubtitle:
            "Everything you need to manage your personal finances clearly and efficiently.",

        dashboardTitle: "Smart Dashboard",
        dashboardText:
            "See your current balance and latest transactions in real time.",

        analyticsTitle: "Financial Analytics",
        analyticsText:
            "Understand your income and expenses through modern charts and insights.",

        exportTitle: "Reports & Export",
        exportText:
            "Export your financial data in PDF, CSV or Excel format.",

        securityTitle: "Secure Account",
        securityText:
            "Login, register, reset password by email and manage your account safely.",

        whyTitle: "Why CashFlow?",
        why1: "Income and expense management",
        why2: "Real-time dashboard",
        why3: "Smart financial statistics",
        why4: "PDF / CSV / Excel export",
        why5: "Password recovery by email",
        why6: "Dark and Light mode",
        why7: "Romanian and English support",

        footerText: "Personal finance management application.",
    },

    ro: {
        navFeatures: "",
        navWhy: "",
        login: "Intră în cont",
        getStarted: "Fă-ți cont",
        day: "Zi",
        night: "Noapte",

        heroTitle: "Controlează-ți finanțele într-un singur loc",
        heroText:
            "CashFlow te ajută să urmărești veniturile, cheltuielile, economiile și statisticile financiare printr-o interfață modernă și intuitivă.",
        heroButton: "Începe acum",


        previewBalance: "Sold curent",
        previewTransactions: "Ultimele tranzacții",
        previewIncome: "Salariu",
        previewFood: "Mâncare",
        previewEntertainment: "Divertisment",

        featuresTitle: "Funcții principale",
        featuresSubtitle:
            "Tot ce ai nevoie pentru a-ți gestiona finanțele personale clar și eficient.",

        dashboardTitle: "Dashboard inteligent",
        dashboardText:
            "Vezi soldul curent și ultimele tranzacții în timp real.",

        analyticsTitle: "Statistici financiare",
        analyticsText:
            "Înțelege veniturile și cheltuielile prin grafice moderne și insight-uri.",

        exportTitle: "Rapoarte și export",
        exportText:
            "Exportă datele financiare în format PDF, CSV sau Excel.",

        securityTitle: "Cont securizat",
        securityText:
            "Autentificare, înregistrare, resetare parolă pe email și administrare cont.",

        whyTitle: "De ce CashFlow?",
        why1: "Gestionare venituri și cheltuieli",
        why2: "Dashboard în timp real",
        why3: "Statistici financiare inteligente",
        why4: "Export PDF / CSV / Excel",
        why5: "Recuperare parolă prin email",
        why6: "Mod Dark și Light",
        why7: "Suport Română și Engleză",

        footerText: "Aplicație pentru managementul finanțelor personale.",
    },
};

function WelcomePage() {
    const navigate = useNavigate();

    const [lang, setLang] = useState(localStorage.getItem("lang") || "ro");
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

    const t = translations[lang];

    useEffect(() => {
        localStorage.setItem("lang", lang);
    }, [lang]);

    useEffect(() => {
        localStorage.setItem("theme", theme);
    }, [theme]);

    const handleThemeToggle = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const goToLogin = () => {
        navigate("/auth?mode=login");
    };

    const goToRegister = () => {
        navigate("/auth?mode=register");
    };

    const scrollToFeatures = () => {
        const section = document.getElementById("features");

        if (section) {
            section.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    const scrollToWhy = () => {
        const section = document.getElementById("why-cashflow");

        if (section) {
            section.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    return (
        <div className={`welcome-page ${theme === "light" ? "welcome-light" : ""}`}>
            <div className="welcome-orb orb-one"></div>
            <div className="welcome-orb orb-two"></div>
            <div className="welcome-orb orb-three"></div>

            <nav className="welcome-navbar">
                <button className="welcome-logo" onClick={() => window.scrollTo(0, 0)}>
                    CashFlow
                </button>

                <div className="welcome-links">
                    <button type="button" onClick={scrollToFeatures}>
                        {t.navFeatures}
                    </button>

                    <button type="button" onClick={scrollToWhy}>
                        {t.navWhy}
                    </button>
                </div>
                <div className="welcome-actions">
                    <LanguageSelector lang={lang} setLang={setLang} />

                    <button className="language-btn" onClick={handleThemeToggle}>
                        {theme === "dark" ? `☀ ${t.day}` : `🌙 ${t.night}`}
                    </button>

                    <button className="welcome-login-btn" onClick={goToLogin}>
                        {t.login}
                    </button>

                    <button className="welcome-main-btn" onClick={goToRegister}>
                        {t.getStarted}
                    </button>
                </div>
            </nav>

            <section className="welcome-hero">
                <div className="welcome-hero-content">
                    <span className="hero-badge">CashFlow Finance App</span>

                    <h1>{t.heroTitle}</h1>

                    <p>{t.heroText}</p>

                    <div className="welcome-hero-buttons">
                        <button className="black-btn" onClick={goToRegister}>
                            {t.heroButton}
                        </button>

                        
                    </div>
                </div>

                <div className="finance-preview-card">
                    <div className="preview-card-glass dashboard-preview">
                        <div className="preview-top">
                            <span>{t.previewBalance}</span>
                            <h2>12.540 RON</h2>
                        </div>

                        <div className="preview-mini-chart">
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>

                        <div className="preview-transactions">
                            <h3>{t.previewTransactions}</h3>

                            <div className="preview-transaction-row income">
                                <div>
                                    <strong>{t.previewIncome}</strong>
                                    <small>Today, 09:20</small>
                                </div>
                                <span>+5.000 RON</span>
                            </div>

                            <div className="preview-transaction-row expense">
                                <div>
                                    <strong>{t.previewFood}</strong>
                                    <small>Today, 13:10</small>
                                </div>
                                <span>-120 RON</span>
                            </div>

                            <div className="preview-transaction-row expense">
                                <div>
                                    <strong>{t.previewEntertainment}</strong>
                                    <small>Yesterday, 20:45</small>
                                </div>
                                <span>-80 RON</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="account-section">
                <div className="section-heading">
                    <h2>{t.featuresTitle}</h2>
                    <p>{t.featuresSubtitle}</p>
                </div>

                <div className="account-cards">
                    <div className="account-card">
                        <div className="account-icon">📊</div>
                        <h3>{t.dashboardTitle}</h3>
                        <p>{t.dashboardText}</p>
                        <button onClick={goToRegister}>{t.getStarted}</button>
                    </div>

                    <div className="account-card">
                        <div className="account-icon">📈</div>
                        <h3>{t.analyticsTitle}</h3>
                        <p>{t.analyticsText}</p>
                        <button onClick={goToRegister}>{t.getStarted}</button>
                    </div>

                    <div className="account-card">
                        <div className="account-icon">📄</div>
                        <h3>{t.exportTitle}</h3>
                        <p>{t.exportText}</p>
                        <button onClick={goToRegister}>{t.getStarted}</button>
                    </div>

                    <div className="account-card">
                        <div className="account-icon">🔐</div>
                        <h3>{t.securityTitle}</h3>
                        <p>{t.securityText}</p>
                        <button onClick={goToRegister}>{t.getStarted}</button>
                    </div>
                </div>
            </section>

            <section id="why-cashflow" className="features-section">
                <h2>{t.whyTitle}</h2>

                <div className="features-grid why-grid">
                    <div className="feature-box">✅ {t.why1}</div>
                    <div className="feature-box">✅ {t.why2}</div>
                    <div className="feature-box">✅ {t.why3}</div>
                    <div className="feature-box">✅ {t.why4}</div>
                    <div className="feature-box">✅ {t.why5}</div>
                    <div className="feature-box">✅ {t.why6}</div>
                    <div className="feature-box">✅ {t.why7}</div>
                </div>
            </section>

            <footer className="welcome-footer">
                <h3>CashFlow © 2026</h3>
                <p>{t.footerText}</p>
            </footer>
        </div>
    );
}

export default WelcomePage;