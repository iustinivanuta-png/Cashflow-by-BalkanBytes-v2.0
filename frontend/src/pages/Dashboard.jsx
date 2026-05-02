import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import AppSidebar from "../components/AppSidebar";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
} from "recharts";

const API = "http://localhost:4000";

const categoryIcons = {
    Food: "🍔",
    Salary: "💼",
    Transport: "🚗",
    Bills: "💡",
    Shopping: "🛍️",
    Health: "❤️",
    Entertainment: "🎬",
    Other: "📦",
};

const categoryLabels = {
    Food: "Food & Drinks",
    Salary: "Income",
    Transport: "Transport",
    Bills: "Bills & Utilities",
    Shopping: "Shopping",
    Health: "Health",
    Entertainment: "Entertainment",
    Other: "Other",
};

function Dashboard() {
    const navigate = useNavigate();
    const profileRef = useRef(null);
    const langRef = useRef(null);

    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
    const [profileOpen, setProfileOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
    const [chartView, setChartView] = useState(
        localStorage.getItem("chartView") || "monthly"
    );

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(() => {
        if (theme === "light") document.body.classList.add("light-mode");
        else document.body.classList.remove("light-mode");

        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem("chartView", chartView);
    }, [chartView]);

    useEffect(() => {
        localStorage.setItem("lang", lang);
    }, [lang]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }

            if (langRef.current && !langRef.current.contains(event.target)) {
                setLangOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/auth";
    };

    const handleThemeToggle = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const fetchData = async () => {
        try {
            setError("");
            setLoading(true);

            const [txRes, summaryRes] = await Promise.all([
                fetch(`${API}/transactions`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API}/summary`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (txRes.status === 401 || summaryRes.status === 401) {
                handleLogout();
                return;
            }

            if (!txRes.ok || !summaryRes.ok) {
                throw new Error("Backend-ul nu răspunde.");
            }

            const txData = await txRes.json();
            const summaryData = await summaryRes.json();

            setTransactions(txData);
            setSummary(summaryData);
        } catch (err) {
            console.error(err);
            setError("Backend-ul nu răspunde. Verifică serverul pe portul 4000.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatMoney = (amount) => {
        return `${Number(amount || 0).toLocaleString("ro-RO")} RON`;
    };

    const cashflowData = useMemo(() => {
        const map = {};
        const now = new Date();

        if (chartView === "weekly") {
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(now.getDate() - i);

                const key = d.toISOString().split("T")[0];

                map[key] = {
                    key,
                    label: d.toLocaleDateString("en-US", { weekday: "short" }),
                    income: 0,
                    expenses: 0,
                    net: 0,
                };
            }

            transactions.forEach((t) => {
                const d = new Date(t.date);
                const key = d.toISOString().split("T")[0];

                if (!map[key]) return;

                const amount = Number(t.amount || 0);

                if (t.type === "income") map[key].income += amount;
                if (t.type === "expense") map[key].expenses += amount;

                map[key].net = map[key].income - map[key].expenses;
            });

            return Object.values(map);
        }

        if (chartView === "monthly") {
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
                    2,
                    "0"
                )}`;

                map[key] = {
                    key,
                    label: d.toLocaleDateString("en-US", { month: "short" }),
                    income: 0,
                    expenses: 0,
                    net: 0,
                };
            }

            transactions.forEach((t) => {
                const d = new Date(t.date);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
                    2,
                    "0"
                )}`;

                if (!map[key]) return;

                const amount = Number(t.amount || 0);

                if (t.type === "income") map[key].income += amount;
                if (t.type === "expense") map[key].expenses += amount;

                map[key].net = map[key].income - map[key].expenses;
            });

            return Object.values(map);
        }

        const currentYear = now.getFullYear();

        for (let i = 4; i >= 0; i--) {
            const year = currentYear - i;

            map[year] = {
                key: String(year),
                label: String(year),
                income: 0,
                expenses: 0,
                net: 0,
            };
        }

        transactions.forEach((t) => {
            const d = new Date(t.date);
            const key = String(d.getFullYear());

            if (!map[key]) return;

            const amount = Number(t.amount || 0);

            if (t.type === "income") map[key].income += amount;
            if (t.type === "expense") map[key].expenses += amount;

            map[key].net = map[key].income - map[key].expenses;
        });

        return Object.values(map);
    }, [transactions, chartView]);

    const lastFiveTransactions = useMemo(() => {
        return [...transactions]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
    }, [transactions]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || payload.length === 0) return null;

        return (
            <div className="cf-tooltip">
                <strong>{label}</strong>

                {payload.map((item) => (
                    <div key={item.dataKey} className="cf-tooltip-row">
                        <span className={`cf-dot ${item.dataKey}`}></span>
                        <span>{item.name}</span>
                        <b>{formatMoney(item.value)}</b>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="app page-enter">
                <div className="bg-orb orb1"></div>
                <div className="bg-orb orb2"></div>
                <div className="bg-orb orb3"></div>

                <div className="dashboard-layout cf-dashboard-layout">
                    <AppSidebar active="dashboard" />

                    <main className="dashboard-main">
                        <div className="dashboard-loader glass">
                            <span className="spinner"></span>
                            <h2>Se încarcă dashboard-ul...</h2>
                            <p>Te rugăm să aștepți puțin.</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="app page-enter">
            <div className="bg-orb orb1"></div>
            <div className="bg-orb orb2"></div>
            <div className="bg-orb orb3"></div>

            <div className="dashboard-layout cf-dashboard-layout">
                <AppSidebar active="dashboard" />

                <main className="dashboard-main cf-dashboard-main">
                    <header className="cf-topbar">
                        <div className="cf-welcome">
                            Welcome back, {user?.name || "User"} <span>👋</span>
                        </div>

                        <div className="cf-topbar-actions">
                            <button
                                className="cf-add-btn"
                                type="button"
                                onClick={() => navigate("/transactions")}
                            >
                                <span>+</span>
                                Add Transaction
                            </button>

                            <div className="cf-lang-wrap" ref={langRef}>
                                <button
                                    type="button"
                                    className="cf-icon-pill"
                                    onClick={() => setLangOpen((prev) => !prev)}
                                >
                                    <span>🌐</span>
                                    {lang === "ro" ? "RO" : "EN"}
                                </button>

                                {langOpen && (
                                    <div className="cf-small-menu">
                                        <button
                                            type="button"
                                            className={lang === "ro" ? "active" : ""}
                                            onClick={() => {
                                                setLang("ro");
                                                setLangOpen(false);
                                            }}
                                        >
                                            🇷🇴 Română
                                        </button>

                                        <button
                                            type="button"
                                            className={lang === "en" ? "active" : ""}
                                            onClick={() => {
                                                setLang("en");
                                                setLangOpen(false);
                                            }}
                                        >
                                            🇺🇸 English
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                className="cf-icon-pill cf-theme-pill"
                                onClick={handleThemeToggle}
                            >
                                {theme === "dark" ? "🌙" : "☀️"}
                            </button>

                            <div className="cf-profile-wrap" ref={profileRef}>
                                <button
                                    className="cf-profile-trigger"
                                    type="button"
                                    onClick={() => setProfileOpen((prev) => !prev)}
                                >
                                    <div className="cf-profile-avatar">
                                        {(user?.name || "U").charAt(0).toUpperCase()}
                                    </div>

                                    <div className="cf-profile-text">
                                        <strong>{user?.name || "User"}</strong>
                                        <span>{user?.email || "No email"}</span>
                                    </div>

                                    <span className="cf-profile-arrow">⌄</span>
                                </button>

                                {profileOpen && (
                                    <div className="cf-profile-menu">
                                        <div className="cf-profile-menu-card">
                                            <div className="cf-profile-avatar large">
                                                {(user?.name || "U").charAt(0).toUpperCase()}
                                            </div>

                                            <div>
                                                <strong>{user?.name || "User"}</strong>
                                                <span>{user?.email || "No email"}</span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => navigate("/settings")}
                                        >
                                            ⚙️ Settings
                                        </button>

                                        <button
                                            type="button"
                                            className="logout"
                                            onClick={handleLogout}
                                        >
                                            🚪 Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {error && <div className="error-box">{error}</div>}

                    <section className="cf-balance-card">
                        <div className="cf-balance-content">
                            <span>Current Balance</span>

                            <h1 className={summary.balance >= 0 ? "positive" : "negative"}>
                                {formatMoney(summary.balance)}
                            </h1>
                        </div>
                    </section>

                    <section className="cf-chart-card">
                        <div className="cf-section-header">
                            <h2>Cash Flow Overview</h2>

                            <div className="cf-chart-toggle">
                                <button
                                    type="button"
                                    className={chartView === "weekly" ? "active" : ""}
                                    onClick={() => setChartView("weekly")}
                                >
                                    Weekly
                                </button>

                                <button
                                    type="button"
                                    className={chartView === "monthly" ? "active" : ""}
                                    onClick={() => setChartView("monthly")}
                                >
                                    Monthly
                                </button>

                                <button
                                    type="button"
                                    className={chartView === "yearly" ? "active" : ""}
                                    onClick={() => setChartView("yearly")}
                                >
                                    Yearly
                                </button>
                            </div>
                        </div>

                        <div className="cf-chart-box">
                            <ResponsiveContainer width="100%" height={340}>
                                <LineChart
                                    data={cashflowData}
                                    margin={{ top: 20, right: 24, left: 0, bottom: 10 }}
                                >
                                    <defs>
                                        <linearGradient id="cfIncomeLine" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#2f80ff" />
                                            <stop offset="100%" stopColor="#60a5fa" />
                                        </linearGradient>

                                        <linearGradient id="cfExpenseLine" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#ff5b5b" />
                                            <stop offset="100%" stopColor="#ff8b7b" />
                                        </linearGradient>

                                        <linearGradient id="cfNetLine" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#6d28d9" />
                                        </linearGradient>
                                    </defs>

                                    <CartesianGrid
                                        stroke="rgba(255,255,255,0.08)"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="label"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: "#94a3b8", fontSize: 13 }}
                                    />

                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: "#94a3b8", fontSize: 13 }}
                                    />

                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        iconType="circle"
                                        wrapperStyle={{ paddingTop: 18 }}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="net"
                                        name="Net Profit"
                                        stroke="url(#cfNetLine)"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6 }}
                                        isAnimationActive={false}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="expenses"
                                        name="Total Expenses"
                                        stroke="url(#cfExpenseLine)"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6 }}
                                        isAnimationActive={false}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="income"
                                        name="Total Income"
                                        stroke="url(#cfIncomeLine)"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6 }}
                                        isAnimationActive={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    <section className="cf-transactions-card">
                        <div className="cf-transactions-header">
                            <h2>Last 5 Transactions</h2>

                            <button
                                type="button"
                                onClick={() => navigate("/transactions")}
                            >
                                View all
                            </button>
                        </div>

                        {lastFiveTransactions.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🕒</div>
                                <h3>No recent transactions</h3>
                                <p>Ultimele 5 tranzacții vor apărea aici.</p>
                            </div>
                        ) : (
                            <div className="cf-table">
                                <div className="cf-table-head">
                                    <span>Description</span>
                                    <span>Category</span>
                                    <span>Date</span>
                                    <span>Amount</span>
                                </div>

                                {lastFiveTransactions.map((t) => {
                                    const icon = categoryIcons[t.category] || "📦";
                                    const categoryLabel =
                                        categoryLabels[t.category] || t.category || "Other";

                                    return (
                                        <div className="cf-table-row" key={t._id}>
                                            <div className="cf-description-cell">
                                                <span
                                                    className={
                                                        t.type === "income"
                                                            ? "cf-row-icon income"
                                                            : "cf-row-icon expense"
                                                    }
                                                >
                                                    {t.type === "income" ? "↓" : "↑"}
                                                </span>

                                                <strong>{t.description || t.category}</strong>
                                            </div>

                                            <div>
                                                <span
                                                    className={
                                                        t.type === "income"
                                                            ? "cf-category-pill income"
                                                            : "cf-category-pill expense"
                                                    }
                                                >
                                                    {t.type === "income" ? "Income" : categoryLabel}
                                                </span>
                                            </div>

                                            <div className="cf-date">
                                                {new Date(t.date).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </div>

                                            <div
                                                className={
                                                    t.type === "income"
                                                        ? "cf-amount positive"
                                                        : "cf-amount negative"
                                                }
                                            >
                                                {t.type === "income" ? "+" : "-"}
                                                {formatMoney(t.amount)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;