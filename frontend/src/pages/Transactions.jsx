import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import "../App.css";

import CustomSelect from "../components/CustomSelect";
import AddTransactionModal from "../components/AddTransactionModal";

import { useLanguage } from "../useLanguage";

const API = "";

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
    const { lang } = useLanguage();

    const [transactions, setTransactions] =
        useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [typeFilter, setTypeFilter] =
        useState("all");

    const [periodFilter, setPeriodFilter] =
        useState("all");

    const [sortBy, setSortBy] =
        useState("date-desc");

    const [editModalOpen, setEditModalOpen] =
        useState(false);

    const [
        selectedTransaction,
        setSelectedTransaction,
    ] = useState(null);

    const token = localStorage.getItem("token");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/auth";
    };

    const fetchTransactions = async () => {
        try {
            setError("");
            setLoading(true);

            const res = await fetch(
                `${API}/api/transactions`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.status === 401) {
                handleLogout();
                return;
            }

            if (!res.ok) {
                throw new Error(
                    "Nu s-au putut încărca tranzacțiile."
                );
            }

            const data = await res.json();

            setTransactions(data);
        } catch (err) {
            console.error(err);

            setError(
                lang === "ro"
                    ? "Eroare la încărcarea tranzacțiilor."
                    : "Failed to load transactions."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();

        const handleTransactionAdded = () =>
            fetchTransactions();

        window.addEventListener(
            "transaction-added",
            handleTransactionAdded
        );

        return () => {
            window.removeEventListener(
                "transaction-added",
                handleTransactionAdded
            );
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isInSelectedPeriod = useCallback(
        (dateString) => {
            if (periodFilter === "all")
                return true;

            const txDate = new Date(dateString);

            const now = new Date();

            const tx = new Date(
                txDate.getFullYear(),
                txDate.getMonth(),
                txDate.getDate()
            );

            const today = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );

            if (periodFilter === "today") {
                return (
                    tx.getTime() ===
                    today.getTime()
                );
            }

            if (periodFilter === "week") {
                const weekStart = new Date(today);

                const day =
                    weekStart.getDay();

                const diff =
                    day === 0
                        ? 6
                        : day - 1;

                weekStart.setDate(
                    today.getDate() - diff
                );

                weekStart.setHours(
                    0,
                    0,
                    0,
                    0
                );

                return (
                    tx >= weekStart &&
                    tx <= today
                );
            }

            if (periodFilter === "month") {
                return (
                    txDate.getMonth() ===
                    now.getMonth() &&
                    txDate.getFullYear() ===
                    now.getFullYear()
                );
            }

            return true;
        },
        [periodFilter]
    );

    const filteredTransactions =
        useMemo(() => {
            let result = [...transactions];

            if (search.trim()) {
                const q = search
                    .toLowerCase()
                    .trim();

                result = result.filter(
                    (t) => {
                        const description = (
                            t.description || ""
                        ).toLowerCase();

                        const category = (
                            t.category || ""
                        ).toLowerCase();

                        return (
                            description.includes(
                                q
                            ) ||
                            category.includes(q)
                        );
                    }
                );
            }

            if (typeFilter !== "all") {
                result = result.filter(
                    (t) =>
                        t.type ===
                        typeFilter
                );
            }

            result = result.filter((t) =>
                isInSelectedPeriod(t.date)
            );

            result.sort((a, b) => {
                switch (sortBy) {
                    case "date-asc":
                        return (
                            new Date(
                                a.createdAt ||
                                a.date
                            ) -
                            new Date(
                                b.createdAt ||
                                b.date
                            )
                        );

                    case "date-desc":
                        return (
                            new Date(
                                b.createdAt ||
                                b.date
                            ) -
                            new Date(
                                a.createdAt ||
                                a.date
                            )
                        );

                    case "amount-asc":
                        return (
                            Number(a.amount) -
                            Number(b.amount)
                        );

                    case "amount-desc":
                        return (
                            Number(b.amount) -
                            Number(a.amount)
                        );

                    default:
                        return 0;
                }
            });

            return result;
        }, [
            transactions,
            search,
            typeFilter,
            sortBy,
            isInSelectedPeriod,
        ]);

    const formatMoney = (amount) => {
        return `${Number(
            amount || 0
        ).toLocaleString("ro-RO")} RON`;
    };

    const openEditModal = (
        transaction
    ) => {
        setSelectedTransaction(
            transaction
        );

        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setSelectedTransaction(null);

        setEditModalOpen(false);
    };

    const handleSaved = () => {
        fetchTransactions();

        closeEditModal();
    };

    const handleDelete = async (id) => {
        const confirmDelete =
            window.confirm(
                lang === "ro"
                    ? "Sigur vrei să ștergi această tranzacție?"
                    : "Are you sure you want to delete this transaction?"
            );

        if (!confirmDelete) return;

        try {
            const res = await fetch(
                `${API}/api/transactions/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.status === 401) {
                handleLogout();
                return;
            }

            if (!res.ok) {
                throw new Error(
                    "Nu s-a putut șterge tranzacția."
                );
            }

            if (
                selectedTransaction?._id ===
                id
            ) {
                closeEditModal();
            }

            fetchTransactions();
        } catch (err) {
            console.error(err);

            alert(
                lang === "ro"
                    ? "Eroare la ștergere."
                    : "Delete failed."
            );
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
            <div className="dashboard-loader glass page-enter">
                <span className="spinner"></span>

                <h2>
                    {lang === "ro"
                        ? "Se încarcă tranzacțiile..."
                        : "Loading transactions..."}
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

            <section className="transactions-toolbar-only">
                <div className="transactions-clean-toolbar">
                    <input
                        type="text"
                        placeholder={
                            lang === "ro"
                                ? "🔍  Caută tranzacții..."
                                : "🔍  Search transactions..."
                        }
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                    <CustomSelect
                        icon="☰"
                        value={typeFilter}
                        onChange={
                            setTypeFilter
                        }
                        options={[
                            {
                                value: "all",
                                label:
                                    lang === "ro"
                                        ? "Toate tipurile"
                                        : "All Types",
                            },

                            {
                                value: "income",
                                label:
                                    lang === "ro"
                                        ? "Venit"
                                        : "Income",
                            },

                            {
                                value: "expense",
                                label:
                                    lang === "ro"
                                        ? "Cheltuială"
                                        : "Expense",
                            },
                        ]}
                    />

                    <CustomSelect
                        icon="▣"
                        value={
                            periodFilter
                        }
                        onChange={
                            setPeriodFilter
                        }
                        options={[
                            {
                                value: "all",
                                label:
                                    lang === "ro"
                                        ? "Tot timpul"
                                        : "All Time",
                            },

                            {
                                value: "today",
                                label:
                                    lang === "ro"
                                        ? "Astăzi"
                                        : "Today",
                            },

                            {
                                value: "week",
                                label:
                                    lang === "ro"
                                        ? "Săptămâna aceasta"
                                        : "This Week",
                            },

                            {
                                value: "month",
                                label:
                                    lang === "ro"
                                        ? "Luna aceasta"
                                        : "This Month",
                            },
                        ]}
                    />

                    <CustomSelect
                        icon="↕"
                        value={sortBy}
                        onChange={setSortBy}
                        options={[
                            {
                                value:
                                    "date-desc",
                                label:
                                    lang === "ro"
                                        ? "Cele mai noi"
                                        : "Newest First",
                            },

                            {
                                value:
                                    "date-asc",
                                label:
                                    lang === "ro"
                                        ? "Cele mai vechi"
                                        : "Oldest First",
                            },

                            {
                                value:
                                    "amount-desc",
                                label:
                                    lang === "ro"
                                        ? "Suma cea mai mare"
                                        : "Highest Amount",
                            },

                            {
                                value:
                                    "amount-asc",
                                label:
                                    lang === "ro"
                                        ? "Suma cea mai mică"
                                        : "Lowest Amount",
                            },
                        ]}
                    />

                    <button
                        className="clear-filters-btn"
                        type="button"
                        onClick={
                            clearFilters
                        }
                    >
                        {lang === "ro"
                            ? "Șterge filtrele ✕"
                            : "Clear Filters ✕"}
                    </button>
                </div>
            </section>

            <section className="v0-transactions-card">
                <div className="v0-transactions-header">
                    <h2>
                        {lang === "ro"
                            ? "Lista tranzacțiilor"
                            : "Transactions List"}
                    </h2>

                    <span>
                        {
                            filteredTransactions.length
                        }{" "}
                        {lang === "ro"
                            ? "elemente"
                            : "items"}
                    </span>
                </div>

                {filteredTransactions.length ===
                    0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            🔎
                        </div>

                        <h3>
                            {lang === "ro"
                                ? "Nu există tranzacții"
                                : "No matching transactions"}
                        </h3>

                        <p>
                            {lang === "ro"
                                ? "Încearcă alte filtre sau căutări."
                                : "Try changing the filters or search."}
                        </p>
                    </div>
                ) : (
                    <div className="transactions-list">
                        {filteredTransactions.map(
                            (t) => {
                                const icon =
                                    categoryIcons[
                                    t
                                        .category
                                    ] ||
                                    "📦";

                                return (
                                    <div
                                        className="transaction-item"
                                        key={
                                            t._id
                                        }
                                    >
                                        <div className="transaction-left">
                                            <div className="transaction-date">
                                                {new Date(
                                                    t.date
                                                ).toLocaleDateString(
                                                    "ro-RO"
                                                )}
                                            </div>

                                            <div className="transaction-main">
                                                <strong>
                                                    <span className="category-icon">
                                                        {
                                                            icon
                                                        }
                                                    </span>{" "}
                                                    {
                                                        t.category
                                                    }
                                                </strong>

                                                <span>
                                                    {t.description ||
                                                        (lang ===
                                                            "ro"
                                                            ? "Fără descriere"
                                                            : "No description")}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="transaction-right">
                                            <span
                                                className={
                                                    t.type ===
                                                        "income"
                                                        ? "type-badge income"
                                                        : "type-badge expense"
                                                }
                                            >
                                                {t.type}
                                            </span>

                                            <strong
                                                className={
                                                    t.type ===
                                                        "income"
                                                        ? "amount income-text"
                                                        : "amount expense-text"
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

                                            <button
                                                className="refresh-btn small-action-btn"
                                                type="button"
                                                onClick={() =>
                                                    openEditModal(
                                                        t
                                                    )
                                                }
                                            >
                                                {lang ===
                                                    "ro"
                                                    ? "Editează"
                                                    : "Edit"}
                                            </button>

                                            <button
                                                className="delete-btn"
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(
                                                        t._id
                                                    )
                                                }
                                            >
                                                {lang ===
                                                    "ro"
                                                    ? "Șterge"
                                                    : "Delete"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                )}
            </section>

            <AddTransactionModal
                open={editModalOpen}
                editMode={true}
                initialData={
                    selectedTransaction
                }
                onClose={
                    closeEditModal
                }
                onSaved={handleSaved}
            />
        </div>
    );
}

export default Transactions;