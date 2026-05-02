import { useEffect, useMemo, useState } from "react";
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
    BarChart,
    Bar,
} from "recharts";

const API = "http://localhost:4000";

function Analytics() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (theme === "light") document.body.classList.add("light-mode");
        else document.body.classList.remove("light-mode");

        localStorage.setItem("theme", theme);
    }, [theme]);

    const handleThemeToggle = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/auth";
    };

    const fetchTransactions = async (showRefreshLoader = false) => {
        try {
            setError("");

            if (showRefreshLoader) setRefreshing(true);
            else setLoading(true);

            const res = await fetch(`${API}/transactions`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                handleLogout();
                return;
            }

            if (!res.ok) {
                throw new Error("Nu s-au putut încărca datele pentru analytics.");
            }

            const data = await res.json();
            setTransactions(data);
        } catch (err) {
            console.error(err);
            setError("Eroare la încărcarea datelor pentru analytics.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const monthlyTrendData = useMemo(() => {
        const monthMap = {};

        transactions.forEach((t) => {
            const d = new Date(t.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
                2,
                "0"
            )}`;

            if (!monthMap[key]) {
                monthMap[key] = {
                    key,
                    label: d.toLocaleDateString("en-US", {
                        month: "short",
                        year: "2-digit",
                    }),
                    income: 0,
                    expenses: 0,
                };
            }

            if (t.type === "income") monthMap[key].income += Number(t.amount || 0);
            if (t.type === "expense") {
                monthMap[key].expenses += Number(t.amount || 0);
            }
        });

        return Object.values(monthMap)
            .sort((a, b) => a.key.localeCompare(b.key))
            .slice(-6)
            .map((m) => ({
                ...m,
                balance: m.income - m.expenses,
            }));
    }, [transactions]);

    const categoryExpenseData = useMemo(() => {
        const totals = {};

        transactions.forEach((t) => {
            if (t.type !== "expense") return;

            const key = t.category || "Other";
            totals[key] = (totals[key] || 0) + Number(t.amount || 0);
        });

        return Object.entries(totals)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    }, [transactions]);

    const analyticsSummary = useMemo(() => {
        let totalIncome = 0;
        let totalExpenses = 0;
        let highestExpense = 0;
        let highestExpenseItem = null;

        transactions.forEach((t) => {
            const amount = Number(t.amount || 0);

            if (t.type === "income") totalIncome += amount;

            if (t.type === "expense") {
                totalExpenses += amount;

                if (amount > highestExpense) {
                    highestExpense = amount;
                    highestExpenseItem = t;
                }
            }
        });

        const savings = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
        const spentPercentage =
            totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

        const averageMonthlySpending =
            monthlyTrendData.length > 0
                ? monthlyTrendData.reduce((sum, month) => sum + month.expenses, 0) /
                monthlyTrendData.length
                : 0;

        const topCategory =
            categoryExpenseData.length > 0 ? categoryExpenseData[0] : null;

        return {
            savings,
            savingsRate,
            spentPercentage,
            averageMonthlySpending,
            highestExpense,
            highestExpenseItem,
            topCategory,
            monthsAnalysed: monthlyTrendData.length,
        };
    }, [transactions, monthlyTrendData, categoryExpenseData]);

    if (loading) {
        return (
            <div className="app page-enter">
                <div className="dashboard-layout">
                    <AppSidebar active="analytics" />

                    <main className="dashboard-main">
                        <div className="dashboard-loader glass">
                            <span className="spinner"></span>
                            <h2>Se încarcă analytics...</h2>
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

            <div className="dashboard-layout">
                <AppSidebar active="analytics" />

                <main className="dashboard-main">
                    <header className="topbar glass">
                        <div>
                            <h1 className="topbar-title">Analytics Overview</h1>
                            <p className="topbar-subtitle">
                                Trends, category behavior and spending insights
                            </p>
                        </div>

                        <div className="header-actions">
                            <button className="theme-btn" onClick={handleThemeToggle}>
                                {theme === "dark" ? "☀ Light" : "🌙 Dark"}
                            </button>

                            <button
                                className="refresh-btn"
                                onClick={() => fetchTransactions(true)}
                                disabled={refreshing}
                            >
                                {refreshing ? (
                                    <span className="btn-loader-wrap">
                                        <span className="spinner small"></span>
                                        Refreshing...
                                    </span>
                                ) : (
                                    "Refresh"
                                )}
                            </button>

                            <button className="delete-btn" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    </header>

                    {error && <div className="error-box">{error}</div>}

                    <section className="analytics-stats-strip">
                        <div className="glass dashboard-card">
                            <span>Savings</span>
                            <h3
                                className={
                                    analyticsSummary.savings >= 0 ? "positive" : "negative"
                                }
                            >
                                {analyticsSummary.savings} RON
                            </h3>
                        </div>

                        <div className="glass dashboard-card">
                            <span>Savings Rate</span>
                            <h3
                                className={
                                    analyticsSummary.savingsRate >= 0 ? "positive" : "negative"
                                }
                            >
                                {analyticsSummary.savingsRate.toFixed(1)}%
                            </h3>
                        </div>

                        <div className="glass dashboard-card">
                            <span>Spent From Income</span>
                            <h3 className="negative">
                                {analyticsSummary.spentPercentage.toFixed(1)}%
                            </h3>
                        </div>

                        <div className="glass dashboard-card">
                            <span>Avg Monthly Spending</span>
                            <h3>{analyticsSummary.averageMonthlySpending.toFixed(0)} RON</h3>
                        </div>
                    </section>

                    <section className="analytics-main-grid">
                        <div className="glass panel analytics-big-panel">
                            <h2>Income vs Expenses Trend</h2>

                            {monthlyTrendData.length === 0 ? (
                                <div className="chart-empty-state">
                                    <div className="chart-empty-icon">📈</div>
                                    <h3>No trend data yet</h3>
                                    <p>Add transactions to generate the monthly trend chart.</p>
                                </div>
                            ) : (
                                <div className="chart-box">
                                    <ResponsiveContainer width="100%" height={340}>
                                        <LineChart data={monthlyTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                            <XAxis dataKey="label" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="income"
                                                name="Income"
                                                strokeWidth={3}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="expenses"
                                                name="Expenses"
                                                strokeWidth={3}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        <div className="glass panel analytics-big-panel">
                            <h2>Expenses by Category</h2>

                            {categoryExpenseData.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📊</div>
                                    <h3>No category expense data</h3>
                                    <p>Add expense transactions to generate the category chart.</p>
                                </div>
                            ) : (
                                <div className="chart-box">
                                    <ResponsiveContainer width="100%" height={340}>
                                        <BarChart data={categoryExpenseData}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar
                                                dataKey="value"
                                                name="Expenses"
                                                radius={[8, 8, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="analytics-insights-grid">
                        <div className="glass panel">
                            <h2>Highest Expense</h2>

                            <div className="analytics-highlight-block">
                                <strong className="negative">
                                    {analyticsSummary.highestExpense} RON
                                </strong>

                                <span>
                                    {analyticsSummary.highestExpenseItem
                                        ? `${analyticsSummary.highestExpenseItem.category} • ${analyticsSummary.highestExpenseItem.description ||
                                        "No description"
                                        }`
                                        : "No expense yet"}
                                </span>
                            </div>
                        </div>

                        <div className="glass panel">
                            <h2>Top Category</h2>

                            <div className="analytics-highlight-block">
                                <strong>
                                    {analyticsSummary.topCategory
                                        ? analyticsSummary.topCategory.name
                                        : "-"}
                                </strong>

                                <span>
                                    {analyticsSummary.topCategory
                                        ? `${analyticsSummary.topCategory.value} RON`
                                        : "No category data"}
                                </span>
                            </div>
                        </div>

                        <div className="glass panel">
                            <h2>Insights</h2>

                            <div className="analytics-highlight-block">
                                <strong>{analyticsSummary.monthsAnalysed}</strong>
                                <span>Months analysed in the current dataset</span>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Analytics;