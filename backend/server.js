require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const transactionsRoute = require("./routes/transactions");
const summaryRoute = require("./routes/summary");
const authRoute = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoute);
app.use("/transactions", transactionsRoute);
app.use("/summary", summaryRoute);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB conectat"))
  .catch((err) => console.error("Eroare MongoDB:", err));

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "JSON invalid" });
  }
  next();
});

app.listen(PORT, () => console.log("Server pornit pe portul", PORT));