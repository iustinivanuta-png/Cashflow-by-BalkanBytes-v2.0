import { useEffect, useMemo, useState } from "react";
import CustomSelect from "../components/CustomSelect";
import { useLanguage } from "../useLanguage";
import "../AddTransactions.css";

const API = "";

const categories = [
    { value: "Food", key: "food", icon: "🍔" },
    { value: "Transport", key: "transport", icon: "🚗" },
    { value: "Shopping", key: "shopping", icon: "🛍️" },
    { value: "Bills", key: "bills", icon: "💡" },
    { value: "Rent", key: "rent", icon: "🏠" },
    { value: "Health", key: "health", icon: "❤️" },
    { value: "Entertainment", key: "fun", icon: "🎬" },
    { value: "Other", key: "other", icon: "•••" },
];

function AddTransactionModal({
    open,
    onClose,
    onSaved,
    editMode = false,
    initialData = null,
}) {
    const [type, setType] = useState("expense");
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("RON");
    const [category, setCategory] = useState("Food");
    const [description, setDescription] = useState("");
    const [dateMode, setDateMode] = useState("today");
    const [customDate, setCustomDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [repeatMonthly, setRepeatMonthly] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    const { lang } = useLanguage();

    const t = {
        ro: {
            addTransaction: "Adaugă tranzacție",
            editTransaction: "Editează tranzacția",
            expense: "Cheltuială",
            income: "Venit",
            amount: "Sumă",
            quickAmounts: "Sume rapide",
            category: "Categorie",
            description: "Descriere",
            date: "Dată",
            today: "Astăzi",
            yesterday: "Ieri",
            pickDate: "Alege data",
            repeatMonthly: "Repetă lunar",
            cancel: "Anulează",
            saving: "Se salvează...",
            saveTransaction: "Salvează tranzacția",
            food: "Mâncare",
            transport: "Transport",
            shopping: "Cumpărături",
            bills: "Facturi",
            rent: "Chirie",
            health: "Sănătate",
            fun: "Distracție",
            other: "Altele",
            placeholder: "ex: Cumpărături Lidl",
            invalidAmount: "Introdu o sumă validă.",
            transactionError: "Tranzacția nu poate fi editată.",
            saveError: "Nu s-a putut salva tranzacția.",
            backendError: "Eroare la salvare. Verifică backend-ul.",
        },

        en: {
            addTransaction: "Add Transaction",
            editTransaction: "Edit Transaction",
            expense: "Expense",
            income: "Income",
            amount: "Amount",
            quickAmounts: "Quick amounts",
            category: "Category",
            description: "Description",
            date: "Date",
            today: "Today",
            yesterday: "Yesterday",
            pickDate: "Pick date",
            repeatMonthly: "Repeat monthly",
            cancel: "Cancel",
            saving: "Saving...",
            saveTransaction: "Save Transaction",
            food: "Food",
            transport: "Transport",
            shopping: "Shopping",
            bills: "Bills",
            rent: "Rent",
            health: "Health",
            fun: "Fun",
            other: "Other",
            placeholder: "ex: Groceries from Lidl",
            invalidAmount: "Enter a valid amount.",
            transactionError: "Transaction cannot be edited.",
            saveError: "Transaction could not be saved.",
            backendError: "Saving error. Check backend.",
        },
    };

    const text = lang === "ro" ? t.ro : t.en;

    const resetForm = () => {
        setType("expense");
        setAmount("");
        setCurrency("RON");
        setCategory("Food");
        setDescription("");
        setDateMode("today");
        setCustomDate(new Date().toISOString().split("T")[0]);
        setRepeatMonthly(false);
        setError("");
    };

    useEffect(() => {
        if (!open) return;

        if (editMode && initialData) {
            setType(initialData.type || "expense");
            setAmount(String(initialData.amount || ""));
            setCurrency(initialData.currency || "RON");
            setCategory(initialData.category || "Food");
            setDescription(initialData.description || "");

            if (initialData.date) {
                const fixedDate = new Date(initialData.date)
                    .toISOString()
                    .split("T")[0];

                setCustomDate(fixedDate);
                setDateMode("custom");
            } else {
                setCustomDate(new Date().toISOString().split("T")[0]);
                setDateMode("today");
            }

            setRepeatMonthly(Boolean(initialData.repeatMonthly));
            setError("");
            return;
        }

        resetForm();
    }, [open, editMode, initialData]);

    const finalDate = useMemo(() => {
        const today = new Date();

        if (dateMode === "today") {
            return today.toISOString().split("T")[0];
        }

        if (dateMode === "yesterday") {
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);

            return yesterday.toISOString().split("T")[0];
        }

        return customDate;
    }, [dateMode, customDate]);

    if (!open) return null;

    const handleClose = () => {
        if (!editMode) {
            resetForm();
        }

        onClose();
    };

    const handleQuickAmount = (value) => {
        setAmount(String(value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!amount || Number(amount) <= 0) {
            setError(text.invalidAmount);
            return;
        }

        if (editMode && !initialData?._id) {
            setError(text.transactionError);
            return;
        }

        try {
            setSaving(true);
            setError("");

            const url = editMode
                ? `${API}/api/transactions/${initialData._id}`
                : `${API}/api/transactions`;

            const res = await fetch(url, {
                method: editMode ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type,
                    amount: Number(amount),
                    category,
                    description: description.trim(),
                    date: finalDate,
                    currency,
                    repeatMonthly,
                }),
            });

            if (res.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/auth";
                return;
            }

            if (!res.ok) {
                throw new Error(text.saveError);
            }

            window.dispatchEvent(new Event("transactions-updated"));

            if (onSaved) {
                onSaved();
            }

            handleClose();
        } catch (err) {
            console.error(err);
            setError(text.backendError);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="addtx-backdrop" onMouseDown={handleClose}>
            <form
                className="addtx-modal"
                onSubmit={handleSubmit}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="addtx-header">
                    <h2>
                        {editMode
                            ? text.editTransaction
                            : text.addTransaction}
                    </h2>

                    <button
                        type="button"
                        className="addtx-close"
                        onClick={handleClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="addtx-type-toggle">
                    <button
                        type="button"
                        className={type === "expense" ? "active expense" : ""}
                        onClick={() => setType("expense")}
                    >
                        ⛔ {text.expense}
                    </button>

                    <button
                        type="button"
                        className={type === "income" ? "active income" : ""}
                        onClick={() => setType("income")}
                    >
                        ✅ {text.income}
                    </button>
                </div>

                <div className="addtx-field">
                    <label>{text.amount}</label>

                    <div className="addtx-amount-row">
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="250.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            autoFocus
                        />

                        <div className="addtx-currency-fixed">
                            RON
                        </div>
                    </div>
                </div>

                <div className="addtx-quick">
                    <span>{text.quickAmounts}</span>

                    <div>
                        {[50, 100, 250, 500].map((value) => (
                            <button
                                key={value}
                                type="button"
                                className={Number(amount) === value ? "active" : ""}
                                onClick={() => handleQuickAmount(value)}
                            >
                                {value}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={() => handleQuickAmount(1000)}
                        >
                            MAX
                        </button>
                    </div>
                </div>

                <div className="addtx-field">
                    <label>{text.category}</label>

                    <div className="addtx-category-grid">
                        {categories.map((item) => (
                            <button
                                type="button"
                                key={item.value}
                                className={
                                    category === item.value
                                        ? "addtx-category active"
                                        : "addtx-category"
                                }
                                onClick={() => setCategory(item.value)}
                            >
                                <span>{item.icon}</span>
                                <strong>{text[item.key]}</strong>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="addtx-field">
                    <label>{text.description}</label>

                    <input
                        type="text"
                        placeholder={text.placeholder}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="addtx-field">
                    <label>{text.date}</label>

                    <div className="addtx-date-row">
                        <button
                            type="button"
                            className={dateMode === "today" ? "active" : ""}
                            onClick={() => setDateMode("today")}
                        >
                            {text.today}
                        </button>

                        <button
                            type="button"
                            className={dateMode === "yesterday" ? "active" : ""}
                            onClick={() => setDateMode("yesterday")}
                        >
                            {text.yesterday}
                        </button>

                        <button
                            type="button"
                            className={dateMode === "custom" ? "active" : ""}
                            onClick={() => setDateMode("custom")}
                        >
                            {text.pickDate}
                        </button>
                    </div>

                    {dateMode === "custom" && (
                        <input
                            type="date"
                            value={customDate}
                            onChange={(e) => setCustomDate(e.target.value)}
                        />
                    )}
                </div>

                <label className="addtx-repeat">
                    <input
                        type="checkbox"
                        checked={repeatMonthly}
                        onChange={(e) => setRepeatMonthly(e.target.checked)}
                    />

                    <span>{text.repeatMonthly}</span>
                </label>

                {error && <div className="addtx-error">{error}</div>}

                <div className="addtx-actions">
                    <button
                        type="button"
                        className="addtx-cancel"
                        onClick={handleClose}
                    >
                        {text.cancel}
                    </button>

                    <button
                        type="submit"
                        className="addtx-submit"
                        disabled={saving}
                    >
                        {saving
                            ? text.saving
                            : editMode
                                ? text.saveTransaction
                                : text.addTransaction}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddTransactionModal;