const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

// ADD transaction
router.post("/", auth, async (req, res) => {
  try {
    const transaction = await Transaction.create({
      ...req.body,
      userId: req.user.id,
    });
    res.json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all transactions
router.get("/", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE by id
router.delete("/:id", auth, async (req, res) => {
  try {
    const raw = String(req.params.id);
    const match = raw.match(/[a-fA-F0-9]{24}/);
    const id = match ? match[0] : null;

    if (!id) {
      return res.status(400).json({ error: "Invalid id format", received: raw });
    }

    const deleted = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Not found", id });
    }

    res.json({ ok: true, id });
  } catch (err) {
    res.status(400).json({ error: err.message, received: req.params.id });
  }
});

// UPDATE by id
router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;