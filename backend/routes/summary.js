const express = require("express");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id });

        let totalIncome = 0;
        let totalExpenses = 0;

        transactions.forEach((t) => {
            const amount = Number(t.amount || 0);

            if (t.type === "income") {
                totalIncome += amount;
            }

            if (t.type === "expense") {
                totalExpenses += amount;
            }
        });

        res.json({
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;