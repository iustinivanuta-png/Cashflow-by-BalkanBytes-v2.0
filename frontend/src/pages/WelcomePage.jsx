import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WelcomePage.css";
import LanguageSelector from "../components/LanguageSelector";

const translations = {
    en: {
        navPersonal: "Personal",
        navBusiness: "Business",
        navKids: "Kids",
        navFeatures: "Features",
        login: "Login",
        getStarted: "Get Started",
        day: "Day",
        night: "Night",
        heroTitle: "Banking & Beyond",
        heroText:
            "Track your money, manage your goals and understand your cashflow in one modern finance dashboard.",
        heroButton: "Choose your account",
        secondButton: "Explore features",
        previewType: "Personal",
        previewAmount: "30,060 RON",
        previewIncome: "Salary",
        previewAccount: "Accounts",
        chooseTitle: "Choose your account type",
        chooseText:
            "CashFlow adapts the experience based on how you want to manage your money.",
        personalTitle: "Personal",
        personalText:
            "Perfect for tracking income, expenses, savings and daily spending.",
        businessTitle: "Business",
        businessText:
            "For freelancers and small businesses with profit, reports and tax estimates.",
        kidsTitle: "Kids",
        kidsText:
            "A simple and friendly experience for savings goals and financial education.",
        choosePersonal: "Choose Personal",
        chooseBusiness: "Choose Business",
        chooseKids: "Choose Kids",
        featuresTitle: "Powerful features",
        feature1: "Smart dashboard",
        feature2: "Reports & exports",
        feature3: "Budget tracking",
        feature4: "Multi-language support",
    },

    ro: {
        navPersonal: "Personal",
        navBusiness: "Business",
        navKids: "Copii",
        navFeatures: "Funcții",
        login: "Intră în cont",
        getStarted: "Fă-ți cont",
        day: "Zi",
        night: "Noapte",
        heroTitle: "Banking & Beyond",
        heroText:
            "Urmărește banii, gestionează obiectivele și înțelege cashflow-ul într-un dashboard financiar modern.",
        heroButton: "Alege tipul contului",
        secondButton: "Vezi funcțiile",
        previewType: "Personal",
        previewAmount: "30.060 RON",
        previewIncome: "Salariu",
        previewAccount: "Conturi",
        chooseTitle: "Alege tipul de cont",
        chooseText:
            "CashFlow adaptează experiența în funcție de modul în care vrei să îți gestionezi banii.",
        personalTitle: "Personal",
        personalText:
            "Perfect pentru venituri, cheltuieli, economii și buget personal.",
        businessTitle: "Business",
        businessText:
            "Pentru freelanceri și firme mici, cu profit, rapoarte și estimare taxe.",
        kidsTitle: "Copii",
        kidsText:
            "O experiență simplă și prietenoasă pentru obiective de economisire.",
        choosePersonal: "Alege Personal",
        chooseBusiness: "Alege Business",
        chooseKids: "Alege Copii",
        featuresTitle: "Funcții principale",
        feature1: "Dashboard inteligent",
        feature2: "Rapoarte și export",
        feature3: "Bugete",
        feature4: "Suport EN / RO",
    },
};

function WelcomePage() {
    const navigate = useNavigate();

    const [lang, setLang] = useState(localStorage.getItem("lang") || "ro");
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
    const [selectedType, setSelectedType] = useState(
        localStorage.getItem("accountType") || ""
    );

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

    const chooseAccount = (type) => {
        setSelectedType(type);
        localStorage.setItem("accountType", type);
        navigate("/auth?mode=register");
    };

    const scrollToAccounts = () => {
        document
            .getElementById("account-types")
            ?.scrollIntoView({ behavior: "smooth" });
    };

    const scrollToFeatures = () => {
        document
            .getElementById("features")
            ?.scrollIntoView({ behavior: "smooth" });
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
                    <button onClick={scrollToAccounts}>{t.navPersonal}</button>
                    <button onClick={scrollToAccounts}>{t.navBusiness}</button>
                    <button onClick={scrollToAccounts}>{t.navKids}</button>
                    <button onClick={scrollToFeatures}>{t.navFeatures}</button>
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
                        <button className="black-btn" onClick={scrollToAccounts}>
                            {t.heroButton}
                        </button>

                        <button className="white-btn" onClick={scrollToFeatures}>
                            {t.secondButton}
                        </button>
                    </div>
                </div>

                <div className="finance-preview-card">
                    <div className="preview-card-glass">
                        <span>{t.previewType}</span>
                        <h2>{t.previewAmount}</h2>
                        <button onClick={scrollToAccounts}>{t.previewAccount}</button>

                        <div className="salary-card">
                            <div className="salary-icon">💰</div>

                            <div>
                                <strong>{t.previewIncome}</strong>
                                <small>Today, 11:28</small>
                            </div>

                            <span>+12,750 RON</span>
                        </div>
                    </div>
                </div>
            </section>

            <section id="account-types" className="account-section">
                <div className="section-heading">
                    <h2>{t.chooseTitle}</h2>
                    <p>{t.chooseText}</p>
                </div>

                <div className="account-cards">
                    <div
                        className={
                            selectedType === "personal"
                                ? "account-card selected"
                                : "account-card"
                        }
                    >
                        <div className="account-icon">👤</div>
                        <h3>{t.personalTitle}</h3>
                        <p>{t.personalText}</p>
                        <button onClick={() => chooseAccount("personal")}>
                            {t.choosePersonal}
                        </button>
                    </div>

                    <div
                        className={
                            selectedType === "business"
                                ? "account-card selected"
                                : "account-card"
                        }
                    >
                        <div className="account-icon">💼</div>
                        <h3>{t.businessTitle}</h3>
                        <p>{t.businessText}</p>
                        <button onClick={() => chooseAccount("business")}>
                            {t.chooseBusiness}
                        </button>
                    </div>

                    <div
                        className={
                            selectedType === "kids" ? "account-card selected" : "account-card"
                        }
                    >
                        <div className="account-icon">🧒</div>
                        <h3>{t.kidsTitle}</h3>
                        <p>{t.kidsText}</p>
                        <button onClick={() => chooseAccount("kids")}>
                            {t.chooseKids}
                        </button>
                    </div>
                </div>
            </section>

            <section id="features" className="features-section">
                <h2>{t.featuresTitle}</h2>

                <div className="features-grid">
                    <div className="feature-box">📊 {t.feature1}</div>
                    <div className="feature-box">📄 {t.feature2}</div>
                    <div className="feature-box">🎯 {t.feature3}</div>
                    <div className="feature-box">🌐 {t.feature4}</div>
                </div>
            </section>
        </div>
    );
}

export default WelcomePage;