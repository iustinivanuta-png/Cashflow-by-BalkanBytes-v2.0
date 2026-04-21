const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const tx = await Transaction.find({ userId: req.user.id });

    let totalIncome = 0;
    let totalExpenses = 0;

    for (const t of tx) {
      if (t.type === "income") totalIncome += t.amount;
      if (t.type === "expense") totalExpenses += t.amount;
    }

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