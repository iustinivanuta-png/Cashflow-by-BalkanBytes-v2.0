require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");

const transactionsRoute = require("./routes/transactions");
const summaryRoute = require("./routes/summary");
const authRoute = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use("/auth", authRoute);
app.use("/api/transactions", transactionsRoute);
app.use("/api/summary", summaryRoute);

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB conectat"))
    .catch((err) => console.error("Eroare MongoDB:", err));

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log("Server pornit pe portul", PORT));