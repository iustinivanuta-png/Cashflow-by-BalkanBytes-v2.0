import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

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

function Transactions() {
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [periodFilter, setPeriodFilter] = useState("all");
    const [sortBy, setSortBy] = useState("date-desc");

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        type: "expense",
        amount: "",
        category: "Food",
        date: new Date().toISOString().split("T")[0],
        description: "",
    });

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
                throw new Error("Nu s-au putut încărca tranzacțiile.");
            }

            const data = await res.json();
            setTransactions(data);
        } catch (err) {
            console.error(err);
            setError("Eroare la încărcarea tranzacțiilor.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const isInSelectedPeriod = (dateString) => {
        if (periodFilter === "all") return true;

        const txDate = new Date(dateString);
        const now = new Date();

        const tx = new Date(
            txDate.getFullYear(),
            txDate.getMonth(),
            txDate.getDate()
        );
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (periodFilter === "today") {
            return tx.getTime() === today.getTime();
        }

        if (periodFilter === "week") {
            const weekStart = new Date(today);
            const day = weekStart.getDay();
            const diff = day === 0 ? 6 : day - 1;
            weekStart.setDate(today.getDate() - diff);
            weekStart.setHours(0, 0, 0, 0);
            return tx >= weekStart && tx <= today;
        }

        if (periodFilter === "month") {
            return (
                txDate.getMonth() === now.getMonth() &&
                txDate.getFullYear() === now.getFullYear()
            );
        }

        return true;
    };

    const filteredTransactions = useMemo(() => {
        let result = [...transactions];

        if (search.trim()) {
            const q = search.toLowerCase().trim();
            result = result.filter((t) => {
                const description = (t.description || "").toLowerCase();
                const category = (t.category || "").toLowerCase();
                return description.includes(q) || category.includes(q);
            });
        }

        if (typeFilter !== "all") {
            result = result.filter((t) => t.type === typeFilter);
        }

        result = result.filter((t) => isInSelectedPeriod(t.date));

        result.sort((a, b) => {
            switch (sortBy) {
                case "date-asc":
                    return new Date(a.date) - new Date(b.date);
                case "date-desc":
                    return new Date(b.date) - new Date(a.date);
                case "amount-asc":
                    return Number(a.amount) - Number(b.amount);
                case "amount-desc":
                    return Number(b.amount) - Number(a.amount);
                default:
                    return 0;
            }
        });

        return result;
    }, [transactions, search, typeFilter, periodFilter, sortBy]);

    const filteredSummary = useMemo(() => {
        let income = 0;
        let expenses = 0;

        filteredTransactions.forEach((t) => {
            if (t.type === "income") income += Number(t.amount || 0);
            if (t.type === "expense") expenses += Number(t.amount || 0);
        });

        return {
            income,
            expenses,
            balance: income - expenses,
            count: filteredTransactions.length,
        };
    }, [filteredTransactions]);

    const startEdit = (transaction) => {
        setEditingId(transaction._id);
        setEditForm({
            type: transaction.type,
            amount: String(transaction.amount),
            category: transaction.category || "Other",
            date: new Date(transaction.date).toISOString().split("T")[0],
            description: transaction.description || "",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({
            type: "expense",
            amount: "",
            category: "Food",
            date: new Date().toISOString().split("T")[0],
            description: "",
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();

        if (!editForm.amount || Number(editForm.amount) <= 0) {
            alert("Introdu o sumă validă.");
            return;
        }

        try {
            const res = await fetch(`${API}/transactions/${editingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...editForm,
                    amount: Number(editForm.amount),
                    category: editForm.category.trim(),
                    description: editForm.description.trim(),
                }),
            });

            if (res.status === 401) {
                handleLogout();
                return;
            }

            if (!res.ok) {
                throw new Error("Nu s-a putut actualiza tranzacția.");
            }

            cancelEdit();
            fetchTransactions(true);
        } catch (err) {
            console.error(err);
            alert("Eroare la editare.");
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
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                handleLogout();
                return;
            }

            if (!res.ok) {
                throw new Error("Nu s-a putut șterge tranzacția.");
            }

            if (editingId === id) cancelEdit();
            fetchTransactions(true);
        } catch (err) {
            console.error(err);
            alert("Eroare la ștergere.");
        }
    };

    const clearFilters = () => {
        setSearch("");
        setTypeFilter("all");
        setPeriodFilter("all");
        setSortBy("date-desc");
    };

    if (loading) {
        return (
            <div className="app page-enter">
                <div className="dashboard-layout">
                    <aside className="sidebar glass">
                        <div className="sidebar-logo">
                            <div className="sidebar-logo-icon">📊</div>
                            <div>
                                <h2>CashFlow</h2>
                                <p>Finance App</p>
                            </div>
                        </div>
                    </aside>
                    <main className="dashboard-main">
                        <div className="dashboard-loader glass">
                            <span className="spinner"></span>
                            <h2>Se încarcă tranzacțiile...</h2>
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
                <aside className="sidebar glass">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">📊</div>
                        <div>
                            <h2>CashFlow</h2>
                            <p>Finance App</p>
                        </div>
                    </div>

                    <nav className="sidebar-menu">
                        <button className="sidebar-item" onClick={() => navigate("/")}>
                            Dashboard
                        </button>
                        <button
                            className="sidebar-item active"
                            onClick={() => navigate("/transactions")}
                        >
                            Transactions
                        </button>
                        <button className="sidebar-item" onClick={() => navigate("/reports")}>
                            Reports
                        </button>
                        <button className="sidebar-item" onClick={() => navigate("/analytics")}>
                            Analytics
                        </button>
                        <button className="sidebar-item" onClick={() => navigate("/settings")}>
                            Settings
                        </button>
                    </nav>

                    <div className="sidebar-user">
                        <strong>{user?.name || "User"}</strong>
                        <span>{user?.email || "No email"}</span>
                    </div>
                </aside>

                <main className="dashboard-main">
                    <header className="topbar glass">
                        <div>
                            <h1 className="topbar-title">Transactions Manager</h1>
                            <p className="topbar-subtitle">
                                Search, filter, sort and edit all your operations
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

                    <section className="glass panel transactions-hero-panel">
                        <div className="transactions-hero-grid">
                            <div className="field">
                                <label>Search</label>
                                <input
                                    type="text"
                                    placeholder="Search by description or category"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="field">
                                <label>Type</label>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                >
                                    <option value="all">all</option>
                                    <option value="income">income</option>
                                    <option value="expense">expense</option>
                                </select>
                            </div>

                            <div className="field">
                                <label>Period</label>
                                <select
                                    value={periodFilter}
                                    onChange={(e) => setPeriodFilter(e.target.value)}
                                >
                                    <option value="all">all time</option>
                                    <option value="today">today</option>
                                    <option value="week">this week</option>
                                    <option value="month">this month</option>
                                </select>
                            </div>

                            <div className="field">
                                <label>Sort by</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="date-desc">date: newest first</option>
                                    <option value="date-asc">date: oldest first</option>
                                    <option value="amount-desc">amount: highest first</option>
                                    <option value="amount-asc">amount: lowest first</option>
                                </select>
                            </div>
                        </div>

                        <div className="transactions-summary-inline">
                            <div className="transactions-mini-chip">
                                <span>Results</span>
                                <strong>{filteredSummary.count}</strong>
                            </div>
                            <div className="transactions-mini-chip">
                                <span>Income</span>
                                <strong className="positive">{filteredSummary.income} RON</strong>
                            </div>
                            <div className="transactions-mini-chip">
                                <span>Expenses</span>
                                <strong className="negative">{filteredSummary.expenses} RON</strong>
                            </div>
                            <div className="transactions-mini-chip">
                                <span>Balance</span>
                                <strong
                                    className={filteredSummary.balance >= 0 ? "positive" : "negative"}
                                >
                                    {filteredSummary.balance} RON
                                </strong>
                            </div>
                            <button className="refresh-btn" type="button" onClick={clearFilters}>
                                Clear filters
                            </button>
                        </div>
                    </section>

                    <section className="transactions-page-grid">
                        {editingId && (
                            <div className="glass panel">
                                <h2>Edit Transaction</h2>

                                <form className="transaction-form" onSubmit={handleSaveEdit}>
                                    <div className="form-row">
                                        <div className="field">
                                            <label>Type</label>
                                            <select
                                                name="type"
                                                value={editForm.type}
                                                onChange={handleEditChange}
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
                                                value={editForm.amount}
                                                onChange={handleEditChange}
                                                placeholder="ex: 250"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="field">
                                            <label>Category</label>
                                            <select
                                                name="category"
                                                value={editForm.category}
                                                onChange={handleEditChange}
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
                                                value={editForm.date}
                                                onChange={handleEditChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="field">
                                        <label>Description / Notes</label>
                                        <input
                                            type="text"
                                            name="description"
                                            value={editForm.description}
                                            onChange={handleEditChange}
                                            placeholder="Add a more detailed note"
                                        />
                                    </div>

                                    <div className="transactions-actions-row">
                                        <button className="add-btn" type="submit">
                                            Save changes
                                        </button>
                                        <button
                                            className="refresh-btn"
                                            type="button"
                                            onClick={cancelEdit}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="glass panel transactions-list-panel">
                            <div className="transactions-list-header">
                                <h2>Transactions List</h2>
                                <span>{filteredTransactions.length} items</span>
                            </div>

                            {filteredTransactions.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">🔎</div>
                                    <h3>No matching transactions</h3>
                                    <p>Try changing the search, filters or sorting options.</p>
                                </div>
                            ) : (
                                <div className="transactions-list">
                                    {filteredTransactions.map((t) => {
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
                                                        className="refresh-btn small-action-btn"
                                                        type="button"
                                                        onClick={() => startEdit(t)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="delete-btn"
                                                        type="button"
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
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Transactions;