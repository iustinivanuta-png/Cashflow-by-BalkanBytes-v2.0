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

const categories = [
    "Food",
    "Salary",
    "Transport",
    "Bills",
    "Shopping",
    "Health",
    "Entertainment",
    "Other",
];

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
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
    const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
    const [profileOpen, setProfileOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [chartView, setChartView] = useState(localStorage.getItem("chartView") || "monthly");
    const [form, setForm] = useState({
        type: "expense",
        amount: "",
        category: "Food",
        date: new Date().toISOString().split("T")[0],
        description: "",
    });

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
            if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
            if (langRef.current && !langRef.current.contains(event.target)) setLangOpen(false);
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

    const authHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    const fetchData = async () => {
        try {
            setError("");
            setLoading(true);

            const [txRes, summaryRes] = await Promise.all([
                fetch(`${API}/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API}/summary`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            if (txRes.status === 401 || summaryRes.status === 401) {
                handleLogout();
                return;
            }

            if (!txRes.ok || !summaryRes.ok) throw new Error("Backend-ul nu răspunde.");

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

    const refreshData = async () => {
        try {
            const [txRes, summaryRes] = await Promise.all([
                fetch(`${API}/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API}/summary`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            if (txRes.status === 401 || summaryRes.status === 401) {
                handleLogout();
                return;
            }

            setTransactions(await txRes.json());
            setSummary(await summaryRes.json());
        } catch (err) {
            console.error(err);
            setError("Nu s-au putut actualiza datele.");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatMoney = (amount) => `${Number(amount || 0).toLocaleString("ro-RO")} RON`;

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();

        if (!form.amount || Number(form.amount) <= 0) {
            alert("Introdu o sumă validă.");
            return;
        }

        try {
            setSaving(true);
            const res = await fetch(`${API}/transactions`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    ...form,
                    amount: Number(form.amount),
                    category: form.category.trim(),
                    description: form.description.trim(),
                }),
            });

            if (res.status === 401) {
                handleLogout();
                return;
            }

            if (!res.ok) throw new Error("Nu s-a putut adăuga tranzacția.");

            setForm({
                type: "expense",
                amount: "",
                category: "Food",
                date: new Date().toISOString().split("T")[0],
                description: "",
            });
            setAddOpen(false);
            refreshData();
        } catch (err) {
            console.error(err);
            alert("Eroare la adăugare.");
        } finally {
            setSaving(false);
        }
    };

    const cashflowData = useMemo(() => {
        const map = {};
        const now = new Date();

        if (chartView === "weekly") {
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(now.getDate() - i);
                const key = d.toISOString().split("T")[0];
                map[key] = { key, label: d.toLocaleDateString("en-US", { weekday: "short" }), income: 0, expenses: 0, net: 0 };
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
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                map[key] = { key, label: d.toLocaleDateString("en-US", { month: "short" }), income: 0, expenses: 0, net: 0 };
            }

            transactions.forEach((t) => {
                const d = new Date(t.date);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
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
            map[year] = { key: String(year), label: String(year), income: 0, expenses: 0, net: 0 };
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
        return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    }, [transactions]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || payload.length === 0) return null;

        return (
            <div className="v0-tooltip">
                <strong>{label}</strong>
                {payload.map((item) => (
                    <div key={item.dataKey} className="v0-tooltip-row">
                        <span className={`v0-tooltip-dot ${item.dataKey}`}></span>
                        <span>{item.name}</span>
                        <b>{formatMoney(item.value)}</b>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="v0-dashboard-page page-enter">
                <div className="v0-shell">
                    <AppSidebar active="dashboard" />
                    <main className="v0-main">
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
        <div className="v0-dashboard-page page-enter">
            <div className="v0-shell">
                <AppSidebar active="dashboard" />

                <main className="v0-main">
                    <header className="v0-header">
                        <h1>
                            Welcome back, {user?.name || "User"} <span>👋</span>
                        </h1>

                        <div className="v0-header-actions">
                            <button className="v0-add-button" type="button" onClick={() => setAddOpen(true)}>
                                <span>+</span>
                                Add Transaction
                            </button>

                            <div className="v0-lang" ref={langRef}>
                                <button className="v0-pill-button" type="button" onClick={() => setLangOpen((prev) => !prev)}>
                                    <span>🌐</span>
                                    {lang === "ro" ? "RO" : "EN"}
                                </button>

                                {langOpen && (
                                    <div className="v0-dropdown v0-lang-menu">
                                        <button className={lang === "ro" ? "active" : ""} type="button" onClick={() => { setLang("ro"); setLangOpen(false); }}>
                                            🇷🇴 Română
                                        </button>
                                        <button className={lang === "en" ? "active" : ""} type="button" onClick={() => { setLang("en"); setLangOpen(false); }}>
                                            🇺🇸 English
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button className="v0-theme-toggle" type="button" onClick={handleThemeToggle}>
                                {theme === "dark" ? "🌙" : "☀️"}
                            </button>

                            <div className="v0-profile" ref={profileRef}>
                                <button className="v0-profile-trigger" type="button" onClick={() => setProfileOpen((prev) => !prev)}>
                                    <span className="v0-avatar">{(user?.name || "U").charAt(0).toUpperCase()}</span>
                                    <span className="v0-user-text">
                                        <strong>{user?.name || "User"}</strong>
                                        <small>{user?.email || "No email"}</small>
                                    </span>
                                    <span className="v0-chevron">⌄</span>
                                </button>

                                {profileOpen && (
                                    <div className="v0-dropdown v0-profile-menu">
                                        <div className="v0-profile-card">
                                            <span className="v0-avatar large">{(user?.name || "U").charAt(0).toUpperCase()}</span>
                                            <div>
                                                <strong>{user?.name || "User"}</strong>
                                                <small>{user?.email || "No email"}</small>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => navigate("/settings")}>⚙️ Settings</button>
                                        <button type="button" className="logout" onClick={handleLogout}>🚪 Logout</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {error && <div className="error-box">{error}</div>}

                    <section className="v0-balance-card">
                        <div>
                            <div className="v0-balance-label">Current Balance <span>●</span></div>
                            <h2 className={summary.balance >= 0 ? "positive" : "negative"}>{formatMoney(summary.balance)}</h2>
                            <p>Total available balance based on your income and expenses.</p>
                        </div>
                        <div className="v0-wallet-icon">💳</div>
                    </section>

                    <section className="v0-chart-card">
                        <div className="v0-section-header">
                            <div>
                                <h2>Cash Flow Overview</h2>
                                <p>Track income, expenses and net balance over time.</p>
                            </div>

                            <div className="v0-period-toggle">
                                {[
                                    ["weekly", "Weekly"],
                                    ["monthly", "Monthly"],
                                    ["yearly", "Yearly"],
                                ].map(([key, label]) => (
                                    <button key={key} type="button" className={chartView === key ? "active" : ""} onClick={() => setChartView(key)}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="v0-chart-box">
                            <ResponsiveContainer width="100%" height={330}>
                                <LineChart data={cashflowData} margin={{ top: 18, right: 24, left: 0, bottom: 8 }}>
                                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 13 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 13 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: 18 }} />
                                    <Line type="monotone" dataKey="net" name="Net Profit" stroke="#8b5cf6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} isAnimationActive={false} />
                                    <Line type="monotone" dataKey="expenses" name="Total Expenses" stroke="#ff5b5b" strokeWidth={3} dot={false} activeDot={{ r: 6 }} isAnimationActive={false} />
                                    <Line type="monotone" dataKey="income" name="Total Income" stroke="#2f80ff" strokeWidth={3} dot={false} activeDot={{ r: 6 }} isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    <section className="v0-transactions-card">
                        <div className="v0-transactions-header">
                            <h2>Last 5 Transactions</h2>
                            <button type="button" onClick={() => navigate("/transactions")}>View all</button>
                        </div>

                        {lastFiveTransactions.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🕒</div>
                                <h3>No recent transactions</h3>
                                <p>Ultimele 5 tranzacții vor apărea aici.</p>
                            </div>
                        ) : (
                            <div className="v0-table">
                                <div className="v0-table-head">
                                    <span>Description</span>
                                    <span>Category</span>
                                    <span>Date</span>
                                    <span>Amount</span>
                                </div>

                                {lastFiveTransactions.map((t) => {
                                    const label = t.type === "income" ? "Income" : categoryLabels[t.category] || t.category || "Other";
                                    return (
                                        <div className="v0-table-row" key={t._id}>
                                            <div className="v0-description">
                                                <span className={t.type === "income" ? "v0-row-icon income" : "v0-row-icon expense"}>{t.type === "income" ? "↓" : "↑"}</span>
                                                <strong>{t.description || t.category || "Transaction"}</strong>
                                            </div>
                                            <span className={t.type === "income" ? "v0-category income" : "v0-category expense"}>{label}</span>
                                            <span className="v0-date">{new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                            <strong className={t.type === "income" ? "v0-amount positive" : "v0-amount negative"}>
                                                {t.type === "income" ? "+" : "-"}{formatMoney(t.amount)}
                                            </strong>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </main>
            </div>

            {addOpen && (
                <div className="v0-modal-backdrop" onMouseDown={() => setAddOpen(false)}>
                    <form className="v0-modal" onSubmit={handleAddTransaction} onMouseDown={(e) => e.stopPropagation()}>
                        <div className="v0-modal-header">
                            <h2>Add Transaction</h2>
                            <button type="button" onClick={() => setAddOpen(false)}>×</button>
                        </div>

                        <div className="v0-form-grid">
                            <label>
                                Type
                                <select name="type" value={form.type} onChange={handleFormChange}>
                                    <option value="expense">expense</option>
                                    <option value="income">income</option>
                                </select>
                            </label>

                            <label>
                                Amount
                                <input name="amount" type="number" placeholder="ex: 250" value={form.amount} onChange={handleFormChange} />
                            </label>

                            <label>
                                Category
                                <select name="category" value={form.category} onChange={handleFormChange}>
                                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </label>

                            <label>
                                Date
                                <input name="date" type="date" value={form.date} onChange={handleFormChange} />
                            </label>
                        </div>

                        <label className="v0-full-label">
                            Description
                            <input name="description" type="text" placeholder="ex: salary / rent / groceries" value={form.description} onChange={handleFormChange} />
                        </label>

                        <button className="v0-modal-submit" type="submit" disabled={saving}>{saving ? "Saving..." : "Save transaction"}</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
