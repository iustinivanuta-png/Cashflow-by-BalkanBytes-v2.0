import { useEffect, useMemo, useState } from "react";
import "../App.css";
import { useLanguage } from "../useLanguage";
import "./Analytics.css";

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

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API = "";

function Analytics() {
    const { lang } = useLanguage();

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [chartView, setChartView] = useState(
        localStorage.getItem("chartView") || "monthly"

    );
    const [exportOpen, setExportOpen] = useState(false);
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const t = {
        pageTitle: lang === "ro" ? "Statistici" : "Insights",
        pageSubtitle:
            lang === "ro"
                ? "Analizează veniturile, cheltuielile și obiceiurile tale financiare."
                : "Analyze your income, expenses and financial habits.",

        loadingTitle:
            lang === "ro"
                ? "Se încarcă statisticile..."
                : "Loading insights...",
        loadingSubtitle:
            lang === "ro"
                ? "Te rugăm să aștepți puțin."
                : "Please wait a moment.",
        loadError:
            lang === "ro"
                ? "Nu s-au putut încărca datele."
                : "Could not load data.",

        totalIncome: lang === "ro" ? "Venituri totale" : "Total Income",
        totalExpenses:
            lang === "ro" ? "Cheltuieli totale" : "Total Expenses",
        netBalance: lang === "ro" ? "Sold net" : "Net Balance",
        savingsRate:
            lang === "ro" ? "Rată economisire" : "Savings Rate",
        avgMonthlySpending:
            lang === "ro"
                ? "Cheltuieli medii lunare"
                : "Avg Monthly Spending",
        vsLastPeriod:
            lang === "ro" ? "față de perioada analizată" : "for selected period",

        cashFlowOverview:
            lang === "ro" ? "Cash Flow Overview" : "Cash Flow Overview",
        cashFlowSubtitle:
            lang === "ro"
                ? "Urmărește veniturile, cheltuielile și soldul net în timp."
                : "Track income, expenses and net balance over time.",

        weekly: lang === "ro" ? "Săptămânal" : "Weekly",
        monthly: lang === "ro" ? "Lunar" : "Monthly",
        yearly: lang === "ro" ? "Anual" : "Yearly",

        incomeVsExpenses:
            lang === "ro"
                ? "Venituri vs Cheltuieli"
                : "Income vs Expenses",
        incomeVsExpensesSubtitle:
            lang === "ro"
                ? "Evoluția veniturilor și cheltuielilor pe luni."
                : "Monthly income and expense evolution.",

        expensesByCategory:
            lang === "ro"
                ? "Cheltuieli pe categorii"
                : "Expenses by Category",
        expensesByCategorySubtitle:
            lang === "ro"
                ? "Vezi unde se duc cei mai mulți bani."
                : "See where most of your spending goes.",

        smartInsights:
            lang === "ro" ? "Insights inteligente" : "Smart Insights",
        smartInsightsSubtitle:
            lang === "ro"
                ? "Informații utile despre finanțele tale."
                : "Useful insights about your finances.",

        monthlySummary:
            lang === "ro" ? "Rezumat lunar" : "Monthly Summary",
        monthlySummarySubtitle:
            lang === "ro"
                ? "Venituri, cheltuieli și sold net pe ultimele luni."
                : "Income, expenses and net balance for recent months.",
        month: lang === "ro" ? "Lună" : "Month",
        income: lang === "ro" ? "Venituri" : "Income",
        expenses: lang === "ro" ? "Cheltuieli" : "Expenses",
        balance: lang === "ro" ? "Sold net" : "Net Balance",

        exportTitle:
            lang === "ro" ? "Exportă datele tale" : "Export Your Data",
        exportSubtitle:
            lang === "ro"
                ? "Descarcă sau printează raportul financiar."
                : "Download or print your financial report.",
        exportPDF: lang === "ro" ? "Export PDF" : "Export PDF",
        exportCSV: lang === "ro" ? "Export CSV" : "Export CSV",
        print: lang === "ro" ? "Printează" : "Print",

        highestExpense:
            lang === "ro"
                ? "Cea mai mare cheltuială"
                : "Highest Expense",
        topCategory:
            lang === "ro" ? "Categoria principală" : "Top Category",
        noCategory:
            lang === "ro" ? "Nu există categorie" : "No category",
        noDescription:
            lang === "ro" ? "Fără descriere" : "No description",
        noExpense:
            lang === "ro" ? "Nu există cheltuieli" : "No expenses yet",
        noData:
            lang === "ro"
                ? "Nu există date suficiente."
                : "Not enough data yet.",
        noTransactions:
            lang === "ro"
                ? "Adaugă tranzacții pentru a genera statistici."
                : "Add transactions to generate insights.",
    };

    useEffect(() => {
        localStorage.setItem("chartView", chartView);
    }, [chartView]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/auth";
    };

    const fetchTransactions = async () => {
        try {
            setError("");

            const res = await fetch(`${API}/api/transactions`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                handleLogout();
                return;
            }

            if (!res.ok) {
                throw new Error(t.loadError);
            }

            const data = await res.json();
            setTransactions(data);
        } catch (err) {
            console.error(err);
            setError(t.loadError);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();

        const handleTransactionAdded = () => fetchTransactions();

        window.addEventListener("transaction-added", handleTransactionAdded);
        window.addEventListener("profile-updated", handleTransactionAdded);

        return () => {
            window.removeEventListener(
                "transaction-added",
                handleTransactionAdded
            );
            window.removeEventListener(
                "profile-updated",
                handleTransactionAdded
            );
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatMoney = (amount) =>
        `${Number(amount || 0).toLocaleString("ro-RO")} RON`;

    const formatMonth = (date, withYear = false) => {
        return date.toLocaleDateString(lang === "ro" ? "ro-RO" : "en-US", {
            month: "short",
            year: withYear ? "numeric" : undefined,
        });
    };

    const groupedData = useMemo(() => {
        const map = {};
        const now = new Date();

        if (chartView === "weekly") {
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(now.getDate() - i);

                const key = d.toISOString().split("T")[0];

                map[key] = {
                    key,
                    label: d.toLocaleDateString(
                        lang === "ro" ? "ro-RO" : "en-US",
                        { weekday: "short" }
                    ),
                    income: 0,
                    expenses: 0,
                    net: 0,
                };
            }

            transactions.forEach((transaction) => {
                const d = new Date(transaction.date);
                const key = d.toISOString().split("T")[0];

                if (!map[key]) return;

                const amount = Number(transaction.amount || 0);

                if (transaction.type === "income") {
                    map[key].income += amount;
                }

                if (transaction.type === "expense") {
                    map[key].expenses += amount;
                }

                map[key].net = map[key].income - map[key].expenses;
            });

            return Object.values(map);
        }

        if (chartView === "monthly") {
            for (let i = 11; i >= 0; i--) {
                const d = new Date(
                    now.getFullYear(),
                    now.getMonth() - i,
                    1
                );

                const key = `${d.getFullYear()}-${String(
                    d.getMonth() + 1
                ).padStart(2, "0")}`;

                map[key] = {
                    key,
                    label: formatMonth(d),
                    income: 0,
                    expenses: 0,
                    net: 0,
                };
            }

            transactions.forEach((transaction) => {
                const d = new Date(transaction.date);

                const key = `${d.getFullYear()}-${String(
                    d.getMonth() + 1
                ).padStart(2, "0")}`;

                if (!map[key]) return;

                const amount = Number(transaction.amount || 0);

                if (transaction.type === "income") {
                    map[key].income += amount;
                }

                if (transaction.type === "expense") {
                    map[key].expenses += amount;
                }

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

        transactions.forEach((transaction) => {
            const d = new Date(transaction.date);
            const key = String(d.getFullYear());

            if (!map[key]) return;

            const amount = Number(transaction.amount || 0);

            if (transaction.type === "income") {
                map[key].income += amount;
            }

            if (transaction.type === "expense") {
                map[key].expenses += amount;
            }

            map[key].net = map[key].income - map[key].expenses;
        });

        return Object.values(map);
    }, [transactions, chartView, lang]);

    const monthlyData = useMemo(() => {
        const monthMap = {};

        transactions.forEach((transaction) => {
            const d = new Date(transaction.date);

            const key = `${d.getFullYear()}-${String(
                d.getMonth() + 1
            ).padStart(2, "0")}`;

            if (!monthMap[key]) {
                monthMap[key] = {
                    key,
                    label: d.toLocaleDateString(
                        lang === "ro" ? "ro-RO" : "en-US",
                        {
                            month: "long",
                            year: "numeric",
                        }
                    ),
                    shortLabel: formatMonth(d, true),
                    income: 0,
                    expenses: 0,
                    net: 0,
                };
            }

            const amount = Number(transaction.amount || 0);

            if (transaction.type === "income") {
                monthMap[key].income += amount;
            }

            if (transaction.type === "expense") {
                monthMap[key].expenses += amount;
            }

            monthMap[key].net =
                monthMap[key].income - monthMap[key].expenses;
        });

        return Object.values(monthMap).sort((a, b) =>
            a.key.localeCompare(b.key)
        );
    }, [transactions, lang]);

    const latestMonths = monthlyData.slice(-6);
    const recentMonths = monthlyData.slice(-3);

    const categoryExpenseData = useMemo(() => {
        const totals = {};

        transactions.forEach((transaction) => {
            if (transaction.type !== "expense") return;

            const category = transaction.category || "Other";
            totals[category] =
                (totals[category] || 0) + Number(transaction.amount || 0);
        });

        return Object.entries(totals)
            .map(([name, value]) => ({
                name,
                value,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    }, [transactions]);

    const summary = useMemo(() => {
        let income = 0;
        let expenses = 0;
        let highestExpense = 0;
        let highestExpenseItem = null;

        transactions.forEach((transaction) => {
            const amount = Number(transaction.amount || 0);

            if (transaction.type === "income") {
                income += amount;
            }

            if (transaction.type === "expense") {
                expenses += amount;

                if (amount > highestExpense) {
                    highestExpense = amount;
                    highestExpenseItem = transaction;
                }
            }
        });

        const net = income - expenses;
        const savingsRate = income > 0 ? (net / income) * 100 : 0;
        const averageMonthlySpending =
            latestMonths.length > 0
                ? latestMonths.reduce(
                    (sum, month) => sum + month.expenses,
                    0
                ) / latestMonths.length
                : 0;

        const topCategory =
            categoryExpenseData.length > 0 ? categoryExpenseData[0] : null;

        return {
            income,
            expenses,
            net,
            savingsRate,
            averageMonthlySpending,
            highestExpense,
            highestExpenseItem,
            topCategory,
        };
    }, [transactions, latestMonths, categoryExpenseData]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || payload.length === 0) return null;

        return (
            <div className="v0-tooltip">
                <strong>{label}</strong>

                {payload.map((item) => (
                    <div key={item.dataKey} className="v0-tooltip-row">
                        <span
                            className={`v0-tooltip-dot ${item.dataKey}`}
                        ></span>

                        <span>{item.name}</span>

                        <b>{formatMoney(item.value)}</b>
                    </div>
                ))}
            </div>
        );
    };

    const getSortedTransactions = () => {
        return [...transactions].sort((a, b) => {
            const dateDiff = new Date(b.date) - new Date(a.date);

            if (dateDiff !== 0) {
                return dateDiff;
            }

            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
    };

    const exportPDF = () => {
        if (transactions.length === 0) {
            alert(t.noData);
            return;
        }

        const sortedTransactions = getSortedTransactions();
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("Raport Financiar CashFlow", 14, 20);

        doc.setFontSize(11);
        doc.text(`Utilizator: ${user?.name || "User"}`, 14, 30);
        doc.text(`Generat: ${new Date().toLocaleString("ro-RO")}`, 14, 37);

        doc.text(`Venituri totale: ${formatMoney(summary.income)}`, 14, 50);
        doc.text(`Cheltuieli totale: ${formatMoney(summary.expenses)}`, 14, 57);
        doc.text(`Sold net: ${formatMoney(summary.net)}`, 14, 64);
        doc.text(`Numar tranzactii: ${sortedTransactions.length}`, 14, 71);

        autoTable(doc, {
            startY: 82,
            head: [["Data", "Descriere", "Categorie", "Tip", "Suma"]],
            body: sortedTransactions.map((transaction) => [
                new Date(transaction.date).toLocaleDateString("ro-RO"),
                transaction.description || "-",
                transaction.category || "-",
                transaction.type === "income" ? "Venit" : "Cheltuiala",
                `${transaction.type === "income" ? "+" : "-"}${Number(
                    transaction.amount || 0
                ).toLocaleString("ro-RO")} RON`,
            ]),
            styles: {
                fontSize: 8,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [124, 58, 237],
                textColor: [255, 255, 255],
                fontStyle: "bold",
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245],
            },
        });

        doc.save("cashflow-report.pdf");
    };

    const exportCSV = () => {
        if (transactions.length === 0) {
            alert(t.noData);
            return;
        }

        const sortedTransactions = getSortedTransactions();

        const headers = ["Data", "Descriere", "Categorie", "Tip", "Suma"];

        const rows = sortedTransactions.map((transaction) => [
            new Date(transaction.date).toLocaleDateString("ro-RO"),
            transaction.description || "-",
            transaction.category || "-",
            transaction.type === "income" ? "Venit" : "Cheltuiala",
            `${transaction.type === "income" ? "+" : "-"}${Number(
                transaction.amount || 0
            ).toLocaleString("ro-RO")} RON`,
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row) =>
                row
                    .map((value) => `"${String(value).replace(/"/g, '""')}"`)
                    .join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.setAttribute("download", "cashflow-report.csv");

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportExcel = () => {
        if (transactions.length === 0) {
            alert(t.noData);
            return;
        }

        const sortedTransactions = getSortedTransactions();

        const headers = ["Data", "Descriere", "Categorie", "Tip", "Suma"];

        const rows = sortedTransactions.map((transaction) => [
            new Date(transaction.date).toLocaleDateString("ro-RO"),
            transaction.description || "-",
            transaction.category || "-",
            transaction.type === "income" ? "Venit" : "Cheltuiala",
            `${transaction.type === "income" ? "+" : "-"}${Number(
                transaction.amount || 0
            ).toLocaleString("ro-RO")} RON`,
        ]);

        const excelContent = [
            headers.join("\t"),
            ...rows.map((row) => row.join("\t")),
        ].join("\n");

        const blob = new Blob([excelContent], {
            type: "application/vnd.ms-excel;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.setAttribute("download", "cashflow-report.xls");

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="dashboard-loader glass page-enter">
                <span className="spinner"></span>

                <h2>{t.loadingTitle}</h2>

                <p>{t.loadingSubtitle}</p>
            </div>
        );
    }

    return (
        <div className="v0-page-content page-enter">
            {error && <div className="error-box">{error}</div>}

            <section className="v0-chart-card">
                <div className="v0-section-header">
                    <div>
                        <h2>{t.pageTitle}</h2>
                        <p>{t.pageSubtitle}</p>
                    </div>

                    <div className="analytics-export-dropdown">
                        <button
                            type="button"
                            className="v0-add-button"
                            onClick={() => setExportOpen((prev) => !prev)}
                        >
                            📥 Export ▼
                        </button>

                        {exportOpen && (
                            <div className="analytics-export-menu">
                                <button
                                    type="button"
                                    onClick={() => {
                                        exportPDF();
                                        setExportOpen(false);
                                    }}
                                >
                                    📄 PDF
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        exportCSV();
                                        setExportOpen(false);
                                    }}
                                >
                                    📊 CSV
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        exportExcel();
                                        setExportOpen(false);
                                    }}
                                >
                                    📈 Excel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>



            <section className="v0-chart-card">
                <div className="v0-section-header">
                    <div>
                        <h2>{t.cashFlowOverview}</h2>

                        <p>{t.cashFlowSubtitle}</p>
                    </div>

                    <div className="v0-period-toggle">
                        {[
                            ["weekly", t.weekly],
                            ["monthly", t.monthly],
                            ["yearly", t.yearly],
                        ].map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                className={chartView === key ? "active" : ""}
                                onClick={() => setChartView(key)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="v0-chart-box">
                    <ResponsiveContainer width="100%" height={330}>
                        <LineChart
                            data={groupedData}
                            margin={{
                                top: 18,
                                right: 24,
                                left: 0,
                                bottom: 8,
                            }}
                        >
                            <CartesianGrid
                                stroke="rgba(255,255,255,0.08)"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: "#94a3b8",
                                    fontSize: 13,
                                }}
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: "#94a3b8",
                                    fontSize: 13,
                                }}
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
                                name={t.balance}
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6 }}
                                isAnimationActive={false}
                            />

                            <Line
                                type="monotone"
                                dataKey="expenses"
                                name={t.expenses}
                                stroke="#ff5b5b"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6 }}
                                isAnimationActive={false}
                            />

                            <Line
                                type="monotone"
                                dataKey="income"
                                name={t.income}
                                stroke="#2f80ff"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6 }}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>



            <section className="v0-chart-card">
                <div className="v0-section-header">
                    <div>
                        <h2>{t.expensesByCategory}</h2>

                        <p>{t.expensesByCategorySubtitle}</p>
                    </div>
                </div>

                {categoryExpenseData.length === 0 ? (
                    <div className="chart-empty-state top-space">
                        <div className="chart-empty-icon">📊</div>

                        <h3>{t.noData}</h3>

                        <p>{t.noTransactions}</p>
                    </div>
                ) : (
                    <div className="v0-chart-box">
                        <ResponsiveContainer width="100%" height={330}>
                            <BarChart
                                data={categoryExpenseData}
                                margin={{
                                    top: 18,
                                    right: 24,
                                    left: 0,
                                    bottom: 8,
                                }}
                            >
                                <CartesianGrid
                                    stroke="rgba(255,255,255,0.08)"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: "#94a3b8",
                                        fontSize: 13,
                                    }}
                                />

                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: "#94a3b8",
                                        fontSize: 13,
                                    }}
                                />

                                <Tooltip content={<CustomTooltip />} />


                                <Bar
                                    dataKey="value"
                                    name={t.expenses}
                                    fill="#7c3aed"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </section>

            <section className="analytics-insights-grid">
                <div className="v0-transactions-card">
                    <div className="v0-section-header">
                        <div>
                            <h2>{t.highestExpense}</h2>

                            <p>{t.smartInsightsSubtitle}</p>
                        </div>
                    </div>

                    <div className="analytics-highlight-block top-space">
                        <strong className="negative">
                            {formatMoney(summary.highestExpense)}
                        </strong>

                        <span>
                            {summary.highestExpenseItem
                                ? `${summary.highestExpenseItem.category} • ${summary.highestExpenseItem.description ||
                                t.noDescription
                                }`
                                : t.noExpense}
                        </span>
                    </div>
                </div>

                <div className="v0-transactions-card">
                    <div className="v0-section-header">
                        <div>
                            <h2>{t.topCategory}</h2>

                            <p>{t.expensesByCategorySubtitle}</p>
                        </div>
                    </div>

                    <div className="analytics-highlight-block top-space">
                        <strong>
                            {summary.topCategory
                                ? summary.topCategory.name
                                : "-"}
                        </strong>

                        <span>
                            {summary.topCategory
                                ? formatMoney(summary.topCategory.value)
                                : t.noCategory}
                        </span>
                    </div>
                </div>

                <div className="v0-transactions-card">
                    <div className="v0-section-header">
                        <div>
                            <h2>{t.smartInsights}</h2>

                            <p>{t.smartInsightsSubtitle}</p>
                        </div>
                    </div>

                    <div className="analytics-highlight-block top-space">
                        <strong>
                            {summary.averageMonthlySpending
                                ? formatMoney(summary.averageMonthlySpending)
                                : formatMoney(0)}
                        </strong>

                        <span>{t.avgMonthlySpending}</span>
                    </div>
                </div>
            </section>


        </div>
    );
}

export default Analytics;
