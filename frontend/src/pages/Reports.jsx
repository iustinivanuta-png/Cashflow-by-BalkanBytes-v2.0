import { useEffect, useMemo, useRef, useState } from "react";
import "../App.css";
import AppSidebar from "../components/AppSidebar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API = "http://localhost:4000";

function Reports() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
    const [exportOpen, setExportOpen] = useState(false);

    const dropdownRef = useRef(null);

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(() => {
        if (theme === "light") document.body.classList.add("light-mode");
        else document.body.classList.remove("light-mode");

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
                throw new Error("Nu s-au putut încărca rapoartele.");
            }

            const data = await res.json();
            setTransactions(data);
        } catch (err) {
            console.error(err);
            setError("Eroare la încărcarea rapoartelor.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const monthlyData = useMemo(() => {
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
                    month: d.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
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
            .map((m) => ({
                ...m,
                balance: m.income - m.expenses,
            }));
    }, [transactions]);

    const latestMonths = monthlyData.slice(-6);
    const current = latestMonths[latestMonths.length - 1] || null;
    const previous =
        latestMonths.length > 1 ? latestMonths[latestMonths.length - 2] : null;

    const reportSummary = useMemo(() => {
        if (!current) {
            return {
                income: 0,
                expenses: 0,
                balance: 0,
                highestExpense: 0,
                highestExpenseCategory: "-",
            };
        }

        let highestExpense = 0;
        let highestExpenseCategory = "-";

        transactions.forEach((t) => {
            if (t.type !== "expense") return;

            const d = new Date(t.date);
            const currentDate = new Date(current.key + "-01");

            if (
                d.getMonth() === currentDate.getMonth() &&
                d.getFullYear() === currentDate.getFullYear()
            ) {
                const amount = Number(t.amount || 0);

                if (amount > highestExpense) {
                    highestExpense = amount;
                    highestExpenseCategory = t.category || "Other";
                }
            }
        });

        return {
            income: current.income,
            expenses: current.expenses,
            balance: current.balance,
            highestExpense,
            highestExpenseCategory,
        };
    }, [transactions, current]);

    const exportRows = latestMonths.map((m) => ({
        Month: m.month,
        Income: m.income,
        Expenses: m.expenses,
        Balance: m.balance,
    }));

    const exportCSV = () => {
        if (exportRows.length === 0) {
            alert("Nu există date pentru export.");
            return;
        }

        const headers = ["Month", "Income", "Expenses", "Balance"];
        const rows = exportRows.map((r) => [
            r.Month,
            r.Income,
            r.Expenses,
            r.Balance,
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
        link.setAttribute("download", "cashflow-reports.csv");

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setExportOpen(false);
    };

    const exportExcel = () => {
        if (exportRows.length === 0) {
            alert("Nu există date pentru export.");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(exportRows);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        const fileData = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(fileData, "cashflow-reports.xlsx");
        setExportOpen(false);
    };

    const exportPDF = () => {
        if (exportRows.length === 0) {
            alert("Nu există date pentru export.");
            return;
        }

        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("CashFlow Reports", 14, 18);

        doc.setFontSize(11);
        doc.text(`User: ${user?.name || "Unknown user"}`, 14, 28);
        doc.text(`Generated: ${new Date().toLocaleString("ro-RO")}`, 14, 35);

        autoTable(doc, {
            startY: 46,
            head: [["Month", "Income", "Expenses", "Balance"]],
            body: exportRows.map((r) => [
                r.Month,
                r.Income,
                r.Expenses,
                r.Balance,
            ]),
            styles: { fontSize: 10 },
            headStyles: { fillColor: [37, 99, 235] },
        });

        doc.save("cashflow-reports.pdf");
        setExportOpen(false);
    };

    if (loading) {
        return (
            <div className="app page-enter">
                <div className="dashboard-layout">
                    <AppSidebar active="reports" />

                    <main className="dashboard-main">
                        <div className="dashboard-loader glass">
                            <span className="spinner"></span>
                            <h2>Se încarcă rapoartele...</h2>
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
                <AppSidebar active="reports" />

                <main className="dashboard-main">
                    <header className="topbar glass">
                        <div>
                            <h1 className="topbar-title">Monthly Reports</h1>
                            <p className="topbar-subtitle">
                                Comparison, summaries and advanced exports
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

                    <section className="reports-overview-grid">
                        <div className="glass dashboard-card">
                            <span>Current Month Income</span>
                            <h3 className="positive">{reportSummary.income} RON</h3>
                        </div>

                        <div className="glass dashboard-card">
                            <span>Current Month Expenses</span>
                            <h3 className="negative">{reportSummary.expenses} RON</h3>
                        </div>

                        <div className="glass dashboard-card">
                            <span>Current Month Balance</span>
                            <h3
                                className={
                                    reportSummary.balance >= 0 ? "positive" : "negative"
                                }
                            >
                                {reportSummary.balance} RON
                            </h3>
                        </div>
                    </section>

                    <section className="reports-page-grid">
                        <div className="glass panel">
                            <h2>Month Comparison</h2>

                            {!current ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📅</div>
                                    <h3>No comparison data</h3>
                                    <p>Add transactions to generate monthly comparisons.</p>
                                </div>
                            ) : (
                                <div className="report-comparison-stack">
                                    <div className="report-comparison-card">
                                        <span>Current</span>
                                        <strong>{current.month}</strong>
                                        <small>
                                            Income: {current.income} RON • Expenses:{" "}
                                            {current.expenses} RON
                                        </small>
                                    </div>

                                    <div className="report-comparison-card">
                                        <span>Previous</span>
                                        <strong>{previous?.month || "-"}</strong>
                                        <small>
                                            {previous
                                                ? `Income: ${previous.income} RON • Expenses: ${previous.expenses} RON`
                                                : "No previous month data"}
                                        </small>
                                    </div>

                                    <div className="report-diff-grid">
                                        <div className="report-diff-item">
                                            <span>Income Diff</span>
                                            <strong
                                                className={
                                                    previous && current.income - previous.income >= 0
                                                        ? "positive"
                                                        : "negative"
                                                }
                                            >
                                                {previous ? current.income - previous.income : 0} RON
                                            </strong>
                                        </div>

                                        <div className="report-diff-item">
                                            <span>Expense Diff</span>
                                            <strong
                                                className={
                                                    previous && current.expenses - previous.expenses <= 0
                                                        ? "positive"
                                                        : "negative"
                                                }
                                            >
                                                {previous ? current.expenses - previous.expenses : 0}{" "}
                                                RON
                                            </strong>
                                        </div>

                                        <div className="report-diff-item">
                                            <span>Balance Diff</span>
                                            <strong
                                                className={
                                                    previous && current.balance - previous.balance >= 0
                                                        ? "positive"
                                                        : "negative"
                                                }
                                            >
                                                {previous ? current.balance - previous.balance : 0} RON
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="glass panel">
                            <h2>Report Highlights</h2>

                            <div className="mini-summary">
                                <div className="mini-summary-item">
                                    <span>Highest Expense</span>
                                    <strong className="negative">
                                        {reportSummary.highestExpense} RON
                                    </strong>
                                    <small>{reportSummary.highestExpenseCategory}</small>
                                </div>

                                <div className="mini-summary-item">
                                    <span>Months Available</span>
                                    <strong>{latestMonths.length}</strong>
                                </div>

                                <div className="mini-summary-item">
                                    <span>Best Balance</span>
                                    <strong className="positive">
                                        {latestMonths.length
                                            ? Math.max(...latestMonths.map((m) => m.balance))
                                            : 0}{" "}
                                        RON
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="glass panel">
                        <div className="transactions-list-header">
                            <h2>Monthly Report Table</h2>
                            <span>{latestMonths.length} months</span>
                        </div>

                        {latestMonths.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📄</div>
                                <h3>No report rows yet</h3>
                                <p>
                                    Monthly summaries will appear here after adding transactions.
                                </p>
                            </div>
                        ) : (
                            <div className="report-table">
                                <div className="report-table-head">
                                    <span>Month</span>
                                    <span>Income</span>
                                    <span>Expenses</span>
                                    <span>Balance</span>
                                </div>

                                {latestMonths.map((row) => (
                                    <div className="report-table-row" key={row.key}>
                                        <span>{row.month}</span>
                                        <span className="positive">{row.income} RON</span>
                                        <span className="negative">{row.expenses} RON</span>
                                        <span
                                            className={row.balance >= 0 ? "positive" : "negative"}
                                        >
                                            {row.balance} RON
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Reports;