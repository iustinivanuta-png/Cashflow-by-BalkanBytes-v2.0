import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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

function Dashboard() {
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
    });

    const [form, setForm] = useState({
        type: "expense",
        amount: "",
        category: "Food",
        date: new Date().toISOString().split("T")[0],
        description: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
    const [exportOpen, setExportOpen] = useState(false);

    const dropdownRef = useRef(null);

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(() => {
        if (theme === "light") {
            document.body.classList.add("light-mode");
        } else {
            document.body.classList.remove("light-mode");
        }

        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setExportOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const authHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/auth";
    };

    const fetchData = async (showRefreshLoader = false) => {
        try {
            setError("");

            if (showRefreshLoader) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

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
            setError("Backend-ul nu răspunde. Verifică serverul pe portul 4000.");
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleThemeToggle = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.amount || Number(form.amount) <= 0) {
            alert("Introdu o sumă validă.");
            return;
        }

        if (!form.category.trim()) {
            alert("Introdu o categorie.");
            return;
        }

        if (!form.date) {
            alert("Selectează data.");
            return;
        }

        try {
            const res = await fetch(`${API}/transactions`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    ...form,
                    category: form.category.trim(),
                    description: form.description.trim(),
                    amount: Number(form.amount),
                }),
            });

            if (res.status === 401) {
                handleLogout();
                return;
            }

            if (!res.ok) {
                throw new Error("Nu s-a putut adăuga tranzacția.");
            }

            setForm({
                type: "expense",
                amount: "",
                category: "Food",
                date: new Date().toISOString().split("T")[0],
                description: "",
            });

            fetchData(true);
        } catch (err) {
            console.error(err);
            alert("Eroare la adăugare.");
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Sigur vrei să ștergi această tranzacție?"
        );

        if (!confirmDelete) return;

        try {
            const res = await fetch(`${API}/transactions/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 401) {
                handleLogout();
                return;
            }

            if (!res.ok) {
                throw new Error("Nu s-a putut șterge tranzacția.");
            }

            fetchData(true);
        } catch (err) {
            console.error(err);
            alert("Eroare la ștergere.");
        }
    };

    const getExportRows = () =>
        transactions.map((t) => ({
            Type: t.type,
            Amount: t.amount,
            Category: t.category,
            Date: new Date(t.date).toLocaleDateString("ro-RO"),
            Description: t.description || "",
        }));

    const exportCSV = () => {
        if (transactions.length === 0) {
            alert("Nu există tranzacții pentru export.");
            return;
        }

        const headers = ["Type", "Amount", "Category", "Date", "Description"];

        const rows = transactions.map((t) => [
            t.type,
            t.amount,
            t.category,
            new Date(t.date).toLocaleDateString("ro-RO"),
            t.description || "",
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row) =>
                row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "cashflow-transactions.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setExportOpen(false);
    };

    const exportExcel = () => {
        if (transactions.length === 0) {
            alert("Nu există tranzacții pentru export.");
            return;
        }

        const rows = getExportRows();
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        const fileData = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(fileData, "cashflow-transactions.xlsx");
        setExportOpen(false);
    };

    const exportPDF = () => {
        if (transactions.length === 0) {
            alert("Nu există tranzacții pentru export.");
            return;
        }

        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("CashFlow Report", 14, 18);

        doc.setFontSize(11);
        doc.text(`User: ${user?.name || "Unknown user"}`, 14, 28);
        doc.text(`Email: ${user?.email || "-"}`, 14, 35);
        doc.text(`Generated: ${new Date().toLocaleString("ro-RO")}`, 14, 42);

        doc.setFontSize(12);
        doc.text(`Total Income: ${summary.totalIncome} RON`, 14, 55);
        doc.text(`Total Expenses: ${summary.totalExpenses} RON`, 14, 63);
        doc.text(`Balance: ${summary.balance} RON`, 14, 71);

        const tableRows = transactions.map((t) => [
            t.type,
            `${t.amount} RON`,
            t.category,
            new Date(t.date).toLocaleDateString("ro-RO"),
            t.description || "-",
        ]);

        autoTable(doc, {
            startY: 80,
            head: [["Type", "Amount", "Category", "Date", "Description"]],
            body: tableRows,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [22, 163, 74] },
        });

        doc.save("cashflow-report.pdf");
        setExportOpen(false);
    };

    const chartData = useMemo(
        () => [
            { name: "Income", value: summary.totalIncome || 0 },
            { name: "Expenses", value: summary.totalExpenses || 0 },
        ],
        [summary]
    );

    const categoryData = useMemo(() => {
        const totals = {};

        transactions.forEach((t) => {
            const key = t.category || "Other";
            totals[key] = (totals[key] || 0) + Number(t.amount || 0);
        });

        return Object.entries(totals).map(([name, value]) => ({ name, value }));
    }, [transactions]);

    const monthlySummary = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyTransactions = transactions.filter((t) => {
            const txDate = new Date(t.date);
            return (
                txDate.getMonth() === currentMonth &&
                txDate.getFullYear() === currentYear
            );
        });

        let income = 0;
        let expenses = 0;

        monthlyTransactions.forEach((t) => {
            if (t.type === "income") income += Number(t.amount || 0);
            if (t.type === "expense") expenses += Number(t.amount || 0);
        });

        return {
            income,
            expenses,
            balance: income - expenses,
            count: monthlyTransactions.length,
        };
    }, [transactions]);

    const lastFiveTransactions = useMemo(() => {
        return [...transactions].slice(0, 5);
    }, [transactions]);

    const colors = ["#22c55e", "#ef4444"];
    const categoryColors = [
        "#60a5fa",
        "#a78bfa",
        "#34d399",
        "#f59e0b",
        "#f87171",
        "#38bdf8",
        "#fb7185",
        "#4ade80",
    ];

    if (loading) {
        return (
            <div className="app page-enter">
                <div className="bg-orb orb1"></div>
                <div className="bg-orb orb2"></div>
                <div className="bg-orb orb3"></div>

                <div className="container">
                    <div className="dashboard-loader glass">
                        <span className="spinner"></span>
                        <h2>Se încarcă dashboard-ul...</h2>
                        <p>Te rugăm să aștepți puțin.</p>
                    </div>
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
                <aside className="sidebar glass">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">📊</div>
                        <div>
                            <h2>CashFlow</h2>
                            <p>Finance App</p>
                        </div>
                    </div>

                    <nav className="sidebar-menu">
                        <button
                            className="sidebar-item active"
                            onClick={() => navigate("/")}
                            type="button"
                        >
                            Dashboard
                        </button>

                        <button
                            className="sidebar-item"
                            onClick={() => navigate("/transactions")}
                            type="button"
                        >
                            Transactions
                        </button>

                        <button
                            className="sidebar-item"
                            onClick={() => navigate("/reports")}
                            type="button"
                        >
                            Reports
                        </button>

                        <button
                            className="sidebar-item"
                            onClick={() => navigate("/analytics")}
                            type="button"
                        >
                            Analytics
                        </button>

                        <button
                            className="sidebar-item"
                            onClick={() => navigate("/settings")}
                            type="button"
                        >
                            Settings
                        </button>
                    </nav>

                    <div className="sidebar-user">
                        <strong>{user?.name || "User"}</strong>
                        <span>{user?.email || "No email"}</span>
                    </div>
                </aside>

                <main className="dashboard-main">
                    <header className="topbar glass fade-up delay-1">
                        <div>
                            <h1 className="topbar-title">Financial Dashboard</h1>
                            <p className="topbar-subtitle">
                                Welcome{user?.name ? `, ${user.name}` : ""} • manage your money
                                smarter
                            </p>
                        </div>

                        <div className="header-actions">
                            <button className="theme-btn" onClick={handleThemeToggle}>
                                {theme === "dark" ? "☀ Light" : "🌙 Dark"}
                            </button>

                            <div className="export-dropdown" ref={dropdownRef}>
                                <button
                                    className="export-btn"
                                    onClick={() => setExportOpen((prev) => !prev)}
                                    type="button"
                                >
                                    Export ▾
                                </button>

                                {exportOpen && (
                                    <div className="export-menu">
                                        <button type="button" onClick={exportCSV}>
                                            Export CSV
                                        </button>
                                        <button type="button" onClick={exportExcel}>
                                            Export Excel
                                        </button>
                                        <button type="button" onClick={exportPDF}>
                                            Export PDF
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                className="refresh-btn"
                                onClick={() => fetchData(true)}
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

                    {error && <div className="error-box fade-up delay-1">{error}</div>}

                    <section className="dashboard-cards">
                        <div className="glass dashboard-card fade-up delay-2">
                            <span>Current Balance</span>
                            <h3 className={summary.balance >= 0 ? "positive" : "negative"}>
                                {summary.balance} RON
                            </h3>
                        </div>

                        <div className="glass dashboard-card fade-up delay-3">
                            <span>Total Income</span>
                            <h3 className="positive">{summary.totalIncome} RON</h3>
                        </div>

                        <div className="glass dashboard-card fade-up delay-4">
                            <span>Total Expenses</span>
                            <h3 className="negative">{summary.totalExpenses} RON</h3>
                        </div>

                        <div className="glass dashboard-card fade-up delay-5">
                            <span>This Month Balance</span>
                            <h3
                                className={
                                    monthlySummary.balance >= 0 ? "positive" : "negative"
                                }
                            >
                                {monthlySummary.balance} RON
                            </h3>
                        </div>
                    </section>

                    <section className="dashboard-grid-large fade-up delay-3">
                        <div className="glass panel panel-large">
                            <h2>Income vs Expenses</h2>

                            {summary.totalIncome === 0 && summary.totalExpenses === 0 ? (
                                <div className="chart-empty-state">
                                    <div className="chart-empty-icon">📊</div>
                                    <h3>No financial data yet</h3>
                                    <p>Add an income or expense to see the chart.</p>
                                </div>
                            ) : (
                                <div className="chart-box">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={100}
                                                dataKey="value"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={colors[index % colors.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        <div className="glass panel panel-side">
                            <h2>Monthly Summary</h2>
                            <div className="mini-summary">
                                <div className="mini-summary-item">
                                    <span>Income</span>
                                    <strong className="positive">{monthlySummary.income} RON</strong>
                                </div>
                                <div className="mini-summary-item">
                                    <span>Expenses</span>
                                    <strong className="negative">{monthlySummary.expenses} RON</strong>
                                </div>
                                <div className="mini-summary-item">
                                    <span>Balance</span>
                                    <strong
                                        className={
                                            monthlySummary.balance >= 0 ? "positive" : "negative"
                                        }
                                    >
                                        {monthlySummary.balance} RON
                                    </strong>
                                </div>
                                <div className="mini-summary-item">
                                    <span>Transactions</span>
                                    <strong>{monthlySummary.count}</strong>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="dashboard-grid-middle fade-up delay-4">
                        <div className="glass panel">
                            <h2>Add transaction</h2>

                            <form className="transaction-form" onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="field">
                                        <label>Type</label>
                                        <select
                                            name="type"
                                            value={form.type}
                                            onChange={handleChange}
                                        >
                                            <option value="expense">expense</option>
                                            <option value="income">income</option>
                                        </select>
                                    </div>

                                    <div className="field">
                                        <label>Amount</label>
                                        <input
                                            type="number"
                                            name="amount"
                                            placeholder="ex: 250"
                                            value={form.amount}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="field">
                                        <label>Category</label>
                                        <select
                                            name="category"
                                            value={form.category}
                                            onChange={handleChange}
                                        >
                                            <option value="Food">Food</option>
                                            <option value="Salary">Salary</option>
                                            <option value="Transport">Transport</option>
                                            <option value="Bills">Bills</option>
                                            <option value="Shopping">Shopping</option>
                                            <option value="Health">Health</option>
                                            <option value="Entertainment">Entertainment</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="field">
                                        <label>Date</label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={form.date}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="field">
                                    <label>Description</label>
                                    <input
                                        type="text"
                                        name="description"
                                        placeholder="ex: pizza / salary / transport"
                                        value={form.description}
                                        onChange={handleChange}
                                    />
                                </div>

                                <button className="add-btn" type="submit">
                                    Add transaction
                                </button>
                            </form>
                        </div>

                        <div className="glass panel">
                            <h2>By Category</h2>

                            {categoryData.length === 0 ? (
                                <div className="chart-empty-state">
                                    <div className="chart-empty-icon">🗂️</div>
                                    <h3>No categories yet</h3>
                                    <p>Add transactions to generate the category chart.</p>
                                </div>
                            ) : (
                                <div className="chart-box">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                dataKey="value"
                                                label
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell
                                                        key={`cat-${index}`}
                                                        fill={categoryColors[index % categoryColors.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        <div className="glass panel">
                            <h2>Last 5 Transactions</h2>

                            {lastFiveTransactions.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">🕒</div>
                                    <h3>No recent transactions</h3>
                                    <p>Ultimele 5 tranzacții vor apărea aici.</p>
                                </div>
                            ) : (
                                <div className="transactions-list compact-list">
                                    {lastFiveTransactions.map((t) => {
                                        const icon = categoryIcons[t.category] || "📦";

                                        return (
                                            <div className="transaction-item compact-item" key={t._id}>
                                                <div className="transaction-left">
                                                    <div className="transaction-date">
                                                        {new Date(t.date).toLocaleDateString("ro-RO")}
                                                    </div>
                                                    <div className="transaction-main">
                                                        <strong>
                                                            <span className="category-icon">{icon}</span>{" "}
                                                            {t.category}
                                                        </strong>
                                                        <span>{t.description || "Fără descriere"}</span>
                                                    </div>
                                                </div>

                                                <div className="transaction-right">
                                                    <strong
                                                        className={
                                                            t.type === "income"
                                                                ? "amount income-text"
                                                                : "amount expense-text"
                                                        }
                                                    >
                                                        {t.type === "income" ? "+" : "-"}
                                                        {t.amount} RON
                                                    </strong>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="glass panel fade-up delay-5">
                        <h2>All Transactions</h2>

                        {transactions.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📭</div>
                                <h3>No transactions yet</h3>
                                <p>
                                    Adaugă prima ta tranzacție și începe să îți urmărești bugetul.
                                </p>
                            </div>
                        ) : (
                            <div className="transactions-list">
                                {transactions.map((t) => {
                                    const icon = categoryIcons[t.category] || "📦";

                                    return (
                                        <div className="transaction-item" key={t._id}>
                                            <div className="transaction-left">
                                                <div className="transaction-date">
                                                    {new Date(t.date).toLocaleDateString("ro-RO")}
                                                </div>

                                                <div className="transaction-main">
                                                    <strong>
                                                        <span className="category-icon">{icon}</span>{" "}
                                                        {t.category}
                                                    </strong>
                                                    <span>{t.description || "Fără descriere"}</span>
                                                </div>
                                            </div>

                                            <div className="transaction-right">
                                                <span
                                                    className={
                                                        t.type === "income"
                                                            ? "type-badge income"
                                                            : "type-badge expense"
                                                    }
                                                >
                                                    {t.type}
                                                </span>

                                                <strong
                                                    className={
                                                        t.type === "income"
                                                            ? "amount income-text"
                                                            : "amount expense-text"
                                                    }
                                                >
                                                    {t.type === "income" ? "+" : "-"}
                                                    {t.amount} RON
                                                </strong>

                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(t._id)}
                                                >
                                                    Delete
                                                </button>
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