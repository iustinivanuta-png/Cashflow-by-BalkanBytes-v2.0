import { useEffect, useMemo, useState } from "react";
import "./Savings.css";
import { useLanguage } from "../useLanguage";

const API = "";

function Savings() {
    const { lang } = useLanguage();

    const token = localStorage.getItem("token");

    const [goals, setGoals] = useState([]);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);

    const [goalName, setGoalName] = useState("");
    const [goalTarget, setGoalTarget] = useState("");
    const [moneyAmount, setMoneyAmount] = useState("");

    const [error, setError] = useState("");

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("savingsGoals") || "[]");
        setGoals(saved);
    }, []);

    const saveGoals = (nextGoals) => {
        setGoals(nextGoals);
        localStorage.setItem("savingsGoals", JSON.stringify(nextGoals));
    };

    const handleDeleteGoal = (goalId) => {
        const updatedGoals = goals.filter(
            (goal) => goal.id !== goalId
        );

        saveGoals(updatedGoals);
    };

    const totalSaved = useMemo(() => {
        return goals.reduce((sum, goal) => sum + Number(goal.saved || 0), 0);
    }, [goals]);

    const totalTarget = useMemo(() => {
        return goals.reduce((sum, goal) => sum + Number(goal.target || 0), 0);
    }, [goals]);

    const progress =
        totalTarget > 0 ? Math.min(Math.round((totalSaved / totalTarget) * 100), 100) : 0;

    const formatMoney = (amount) => {
        return `${Number(amount || 0).toLocaleString("ro-RO")} RON`;
    };

    const handleCreateGoal = () => {
        setError("");

        if (!goalName.trim() || !goalTarget || Number(goalTarget) <= 0) {
            setError(
                lang === "ro"
                    ? "Completează denumirea și suma obiectivului."
                    : "Please complete the goal name and target amount."
            );
            return;
        }

        const newGoal = {
            id: crypto.randomUUID(),
            name: goalName.trim(),
            target: Number(goalTarget),
            saved: 0,
            createdAt: new Date().toISOString(),
        };

        saveGoals([newGoal, ...goals]);

        setGoalName("");
        setGoalTarget("");
        setError("");
        setShowGoalModal(false);
    };

    const handleAddMoney = async () => {
        setError("");

        if (!selectedGoal || !moneyAmount || Number(moneyAmount) <= 0) {
            setError(
                lang === "ro"
                    ? "Introdu o sumă validă."
                    : "Enter a valid amount."
            );
            return;
        }

        const amount = Number(moneyAmount);

        try {
            const res = await fetch(`${API}/api/transactions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type: "expense",
                    amount,
                    category: "Other",
                    description: `Savings: ${selectedGoal.name}`,
                    date: new Date().toISOString(),
                }),
            });

            if (!res.ok) {
                throw new Error("Transaction failed");
            }

            const updatedGoals = goals.map((goal) =>
                goal.id === selectedGoal.id
                    ? {
                        ...goal,
                        saved: Math.min(
                            Number(goal.saved || 0) + amount,
                            Number(goal.target)
                        ),
                    }
                    : goal
            );

            saveGoals(updatedGoals);

            window.dispatchEvent(
                new Event("transactions-updated")
            );

            setMoneyAmount("");
            setSelectedGoal(null);
            setShowAddMoneyModal(false);
        } catch (err) {
            setError(
                lang === "ro"
                    ? "Nu s-au putut adăuga banii. Verifică backend-ul."
                    : "Could not add money. Check the backend."
            );
        }
    };

    return (
        <div className="v0-page-content page-enter">
            <section className="savings-header-card">
                <div className="savings-header-content">
                    <div>
                        <h1>{lang === "ro" ? "Economii" : "Savings"}</h1>

                        <p>
                            {lang === "ro"
                                ? "Urmărește obiectivele tale financiare și progresul economiilor."
                                : "Track your financial goals and savings progress."}
                        </p>
                    </div>

                    <button
                        className="savings-add-btn"
                        type="button"
                        onClick={() => {
                            setError("");
                            setShowGoalModal(true);
                        }}
                    >
                        + {lang === "ro" ? "Adaugă obiectiv" : "Add Goal"}
                    </button>
                </div>
            </section>

            {goals.length === 0 ? (
                <section className="savings-empty-state">
                    <div className="savings-empty-icon">💰</div>

                    <h2>
                        {lang === "ro"
                            ? "Nu ai încă obiective de economisire"
                            : "No savings goals yet"}
                    </h2>

                    <p>
                        {lang === "ro"
                            ? "Creează primul tău obiectiv și începe să economisești."
                            : "Create your first goal and start saving money."}
                    </p>

                    <button
                        type="button"
                        className="savings-add-btn"
                        onClick={() => setShowGoalModal(true)}
                    >
                        + {lang === "ro" ? "Adaugă obiectiv" : "Add Goal"}
                    </button>
                </section>
            ) : (
                <>
                    <section className="savings-hero-card">
                        <div className="savings-hero-content">
                            <span className="savings-label">
                                {lang === "ro" ? "Economii totale" : "Total Savings"}
                            </span>

                            <h2>{formatMoney(totalSaved)}</h2>

                            <p className="savings-growth">
                                {goals.length}{" "}
                                {lang === "ro" ? "obiective active" : "active goals"}
                            </p>

                            <div className="savings-progress-row">
                                <div className="savings-progress">
                                    <div
                                        className="savings-progress-fill"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>

                                <strong>{progress}%</strong>
                            </div>

                            <small>
                                {lang === "ro"
                                    ? "Progres total obiective"
                                    : "Overall Goal Progress"}
                            </small>
                        </div>

                        <div className="savings-hero-icon">💰</div>
                    </section>

                    <section className="savings-goals-grid">
                        {goals.map((goal) => {
                            const goalProgress =
                                goal.target > 0
                                    ? Math.min(
                                        Math.round((goal.saved / goal.target) * 100),
                                        100
                                    )
                                    : 0;

                            return (
                                <div className="savings-goal-card" key={goal.id}>
                                    <div>
                                        
                                        <h3>{goal.name}</h3>
                                        <p>
                                            {formatMoney(goal.saved)} /{" "}
                                            {formatMoney(goal.target)}
                                        </p>
                                    </div>

                                    <div className="savings-progress small">
                                        <div
                                            className="savings-progress-fill"
                                            style={{ width: `${goalProgress}%` }}
                                        ></div>
                                    </div>

                                    <div className="savings-goal-footer">
                                        <strong>{goalProgress}%</strong>

                                        <div className="savings-goal-actions">

                                            {goalProgress < 100 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setError("");
                                                        setSelectedGoal(goal);
                                                        setShowAddMoneyModal(true);
                                                    }}
                                                >
                                                    + {lang === "ro"
                                                        ? "Adaugă bani"
                                                        : "Add Money"}
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                className="savings-delete-btn"
                                                onClick={() =>
                                                    handleDeleteGoal(goal.id)
                                                }
                                            >
                                                {lang === "ro"
                                                    ? "Șterge"
                                                    : "Delete"}
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                </>
            )}

            {showGoalModal && (
                <div className="savings-modal-backdrop">
                    <div className="savings-modal">
                        <button
                            className="savings-modal-close"
                            type="button"
                            onClick={() => setShowGoalModal(false)}
                        >
                            ×
                        </button>

                        <h2>{lang === "ro" ? "Obiectiv nou" : "New Goal"}</h2>

                        <input
                            value={goalName}
                            onChange={(e) => setGoalName(e.target.value)}
                            placeholder={
                                lang === "ro"
                                    ? "Denumire obiectiv"
                                    : "Goal name"
                            }
                        />

                        <input
                            type="number"
                            value={goalTarget}
                            onChange={(e) => setGoalTarget(e.target.value)}
                            placeholder={
                                lang === "ro"
                                    ? "Suma de strâns"
                                    : "Target amount"
                            }
                        />

                        {error && <div className="savings-error">{error}</div>}

                        <button
                            className="savings-modal-submit"
                            type="button"
                            onClick={handleCreateGoal}
                        >
                            {lang === "ro" ? "Creează obiectiv" : "Create Goal"}
                        </button>
                    </div>
                </div>
            )}

            {showAddMoneyModal && (
                <div className="savings-modal-backdrop">
                    <div className="savings-modal">
                        <button
                            className="savings-modal-close"
                            type="button"
                            onClick={() => setShowAddMoneyModal(false)}
                        >
                            ×
                        </button>

                        <h2>
                            {lang === "ro"
                                ? `Adaugă bani în ${selectedGoal?.name}`
                                : `Add money to ${selectedGoal?.name}`}
                        </h2>

                        <input
                            type="number"
                            value={moneyAmount}
                            onChange={(e) => setMoneyAmount(e.target.value)}
                            placeholder={
                                lang === "ro"
                                    ? "Suma de adăugat"
                                    : "Amount to add"
                            }
                        />

                        {error && <div className="savings-error">{error}</div>}

                        <button
                            className="savings-modal-submit"
                            type="button"
                            onClick={handleAddMoney}
                        >
                            {lang === "ro" ? "Adaugă bani" : "Add Money"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Savings;