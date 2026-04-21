# 💰 Cashflow-by-BalkanBytes-v2.0

CashFlow este o aplicație web full-stack pentru gestionarea veniturilor și cheltuielilor personale.

Aplicația oferă un backend REST API și un frontend modern realizat cu React.

---

## 🚀 Funcționalități

- Adăugare tranzacții (income / expense)
- Ștergere tranzacții
- Calcul automat:
  - Total venituri
  - Total cheltuieli
  - Balanță
- Refresh date în timp real
- Formatare automată pentru sume mari (ro-RO)
- Persistență date în MongoDB

---

## 🛠️ Tehnologii folosite

Frontend:
- React (Vite)
- JavaScript (ES6+)
- CSS custom (Dark UI)

Backend:
- Node.js
- Express.js
- MongoDB (Mongoose)

---

## 📂 Structura proiectului

cashflow/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md

---

## ⚙️ Instalare și rulare locală

PASUL 1 — Clonează repository-ul:

git clone https://github.com/iustinivanuta-png/Cashflow-by-BalkanBytes.git
cd cashflow

---

PASUL 2 — Backend:

cd backend
npm install

Creează fișierul .env în folderul backend cu următorul conținut:

PORT=4000
MONGO_URI=your_mongodb_connection_string

Pornește serverul backend:

node server.js

Backend-ul va rula pe:
http://localhost:4000

---

PASUL 3 — Frontend:

Deschide un terminal nou și rulează:

cd frontend
npm install
npm run dev

Frontend-ul va rula pe:
http://localhost:5173

---


## 📌 Note importante

- Folderul node_modules nu este inclus în repository
- Fișierul .env trebuie creat local
- Este recomandat MongoDB Atlas pentru baza de date

---

