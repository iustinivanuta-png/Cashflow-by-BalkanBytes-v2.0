import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";


import "../App.css";


import { useLanguage } from "../useLanguage";

const API = "";

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

    const { t, lang } = useLanguage();

    const [transactions, setTransactions] = useState([]);

    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/auth";
    };

    const fetchData = async () => {
        try {
            setError("");
            setLoading(true);

            const [txRes, summaryRes] =
                await Promise.all([
                    fetch(`${API}/api/transactions`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),

                    fetch(`${API}/api/summary`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                ]);

            if (
                txRes.status === 401 ||
                summaryRes.status === 401
            ) {
                handleLogout();
                return;
            }

            if (!txRes.ok || !summaryRes.ok) {
                throw new Error(
                    "Backend-ul nu răspunde."
                );
            }

            const txData = await txRes.json();
            const summaryData =
                await summaryRes.json();

            setTransactions(txData);
            setSummary(summaryData);
        } catch (err) {
            console.error(err);

            setError(
                "Backend-ul nu răspunde. Verifică serverul pe portul 4000."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        const handleTransactionsUpdated = () => {
            fetchData();
        };

        window.addEventListener(
            "transactions-updated",
            handleTransactionsUpdated
        );

        return () => {
            window.removeEventListener(
                "transactions-updated",
                handleTransactionsUpdated
            );
        };
    }, []);

    const formatMoney = (amount) => {
        return `${Number(
            amount || 0
        ).toLocaleString("ro-RO")} RON`;
    };

    const lastTenTransactions = useMemo(() => {
        return [...transactions]
            .sort((a, b) => {
                const dateDiff =
                    new Date(b.date) - new Date(a.date);

                if (dateDiff !== 0) {
                    return dateDiff;
                }

                return (
                    new Date(b.createdAt || 0) -
                    new Date(a.createdAt || 0)
                );
            })
            .slice(0, 10);
    }, [transactions]);

    if (loading) {
        return (
            <div className="dashboard-loader glass">
                <span className="spinner"></span>

                <h2>
                    {lang === "ro"
                        ? "Se încarcă dashboard-ul..."
                        : "Loading dashboard..."}
                </h2>

                <p>
                    {lang === "ro"
                        ? "Te rugăm să aștepți puțin."
                        : "Please wait a moment."}
                </p>
            </div>
        );
    }

    return (
        <div className="v0-page-content page-enter">
            {error && (
                <div className="error-box">
                    {error}
                </div>
            )}

            <section className="v0-balance-card">
                <div className="v0-balance-left">
                    <div className="v0-balance-label">
                        {t.currentBalance}{" "}
                        <span>●</span>
                    </div>

                    <h2
                        className={
                            summary.balance >= 0
                                ? "positive"
                                : "negative"
                        }
                    >
                        {formatMoney(summary.balance)}
                    </h2>
                </div>

                <div className="v0-wallet-icon">
                    💳
                </div>
            </section>

            <section className="v0-transactions-card">
                <div className="v0-transactions-header">
                    <h2>
                        {lang === "ro"
                            ? "Ultimele 10 tranzacții"
                            : "Last 10 Transactions"}
                    </h2>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/transactions"
                            )
                        }
                    >
                        {t.viewAll}
                    </button>
                </div>

                {lastTenTransactions.length ===
                    0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            🕒
                        </div>

                        <h3>
                            {lang === "ro"
                                ? "Nu există tranzacții recente"
                                : "No recent transactions"}
                        </h3>

                        <p>
                            {lang === "ro"
                                ? "Ultimele 10 tranzacții vor apărea aici."
                                : "Your latest 10 transactions will appear here."}
                        </p>
                    </div>
                ) : (
                    <div className="v0-table">
                        <div className="v0-table-head">
                            <span>
                                {lang === "ro"
                                    ? "Descriere"
                                    : "Description"}
                            </span>

                            <span>
                                {lang === "ro"
                                    ? "Categorie"
                                    : "Category"}
                            </span>

                            <span>
                                {lang === "ro"
                                    ? "Dată"
                                    : "Date"}
                            </span>

                            <span>
                                {lang === "ro"
                                    ? "Sumă"
                                    : "Amount"}
                            </span>
                        </div>

                        {lastTenTransactions.map(
                            (t) => {
                                const label =
                                    t.type ===
                                        "income"
                                        ? "Income"
                                        : categoryLabels[
                                        t
                                            .category
                                        ] ||
                                        t.category ||
                                        "Other";

                                return (
                                    <div
                                        className="v0-table-row"
                                        key={t._id}
                                    >
                                        <div className="v0-description">
                                            <span
                                                className={
                                                    t.type ===
                                                        "income"
                                                        ? "v0-row-icon income"
                                                        : "v0-row-icon expense"
                                                }
                                            >
                                                {t.type ===
                                                    "income"
                                                    ? "↓"
                                                    : "↑"}
                                            </span>

                                            <strong>
                                                {t.description ||
                                                    t.category ||
                                                    "Transaction"}
                                            </strong>
                                        </div>

                                        <span
                                            className={
                                                t.type ===
                                                    "income"
                                                    ? "v0-category income"
                                                    : "v0-category expense"
                                            }
                                        >
                                            {label}
                                        </span>

                                        <span className="v0-date">
                                            {new Date(
                                                t.date
                                            ).toLocaleDateString(
                                                "en-US",
                                                {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                }
                                            )}
                                        </span>

                                        <strong
                                            className={
                                                t.type ===
                                                    "income"
                                                    ? "v0-amount positive"
                                                    : "v0-amount negative"
                                            }
                                        >
                                            {t.type ===
                                                "income"
                                                ? "+"
                                                : "-"}

                                            {formatMoney(
                                                t.amount
                                            )}
                                        </strong>
                                    </div>
                                );
                            }
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Dashboard;