<div align="center">

# 🇮🇳 BharatCred

### AI-Powered Credit Scoring for Bharat

**Upload your bank statement. Get your credit score in seconds.**

BharatCred is a full-stack, AI-driven credit intelligence platform that parses bank statements, categorizes transactions using NLP, runs machine learning models to compute a credit score, and delivers rich behavioral financial insights — all in one seamless flow.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://expressjs.com/)
[![Python](https://img.shields.io/badge/Python-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT-412991?style=flat-square&logo=openai)](https://openai.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [ML Model Details](#-ml-model-details)

---

## 🔍 Overview

BharatCred bridges the gap in India's credit ecosystem by providing an alternative credit scoring mechanism based on **actual spending behavior** rather than just loan repayment history. It is especially useful for individuals who are new to credit or do not have a traditional CIBIL score.

A user uploads their bank statement PDF, and BharatCred:

1. Extracts all transactions from the PDF using `pdfjs-dist`
2. Uses **OpenAI GPT** to intelligently parse and clean the raw transaction text
3. Sends clean transactions to a **Python FastAPI + scikit-learn ML engine** that categorizes spending and computes a credit score
4. Generates a human-readable **AI summary** of the user's financial health
5. Stores the report in **MongoDB** and displays a detailed, interactive results dashboard

---

## ✨ Features

- **📄 PDF Bank Statement Upload** — Drop your bank statement and get an instant analysis
- **📊 AI Credit Score (300–900)** — Behavioral ML model trained on spending ratios
- **🧠 NLP Transaction Categorization** — Auto-classifies transactions into Income, Essential, Investment, Leisure, and Risky categories
- **💬 AI Financial Chatbot** — Ask questions about your credit report in plain English
- **📈 Detailed Behavioral Insights** — Spending breakdown, savings rate, transparency index, and more
- **⚠️ Risk & Market Analysis** — Probability of default, cash usage alerts, and stability scoring
- **🔐 Authentication** — Secure user accounts via Clerk
- **💾 Persistent Reports** — Credit reports saved to MongoDB and retrievable at any time
- **🏦 Partner Bank Showcase** — Supports analysis of statements from Axis, HDFC, ICICI, IDFC, Kotak, SBI, and Yes Bank

---

## 🏗 Architecture

BharatCred uses a **tri-service architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                         │
│              React + Vite Frontend (Port 5173)              │
└───────────────────────┬─────────────────────────────────────┘
                        │  HTTP (proxied via Vite)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│               Node.js / Express Bridge (Port 5000)          │
│  • PDF text extraction (pdfjs-dist)                         │
│  • OpenAI GPT — PDF parsing & AI summaries                  │
│  • MongoDB persistence (Mongoose)                           │
│  • Auth header forwarding (Clerk User ID)                   │
└───────────────────────┬─────────────────────────────────────┘
                        │  Internal HTTP (localhost)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Python / FastAPI ML Engine (Port 8000)         │
│  • NLP transaction categorization                           │
│  • RandomForest credit brain (credit_brain.pkl)             │
│  • Probability of Default model (pd_model.pkl)              │
│  • Dynamic score calculation (300–900 range)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router v6, Tailwind CSS, shadcn/ui |
| **Authentication** | Clerk |
| **Node Backend** | Express.js, Multer, pdfjs-dist, Axios |
| **AI / LLM** | OpenAI GPT (transaction parsing + financial summaries) |
| **Database** | MongoDB (Mongoose ODM) |
| **Python Backend** | FastAPI, Uvicorn |
| **ML / Data** | scikit-learn (RandomForestClassifier), pandas, NumPy, joblib |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- **Python** 3.10+
- **MongoDB** instance (local or Atlas)
- **OpenAI API key**
- **Clerk** account and application keys

---

### Environment Variables

Create a `.env` file inside `backend_node/`:

```env
# MongoDB
DB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/bharatcred

# OpenAI
OPENAI_API_KEY=sk-...

# Port (optional, defaults to 5000)
PORT=5000
```

Create a `.env.local` file inside `frontend/`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_...
```

---

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-username/bharatcred.git
cd bharatcred
```

**2. Install Node backend dependencies**

```bash
cd backend_node
npm install
```

**3. Install frontend dependencies**

```bash
cd ../frontend
npm install
```

**4. Install Python backend dependencies**

```bash
cd ../backend_python
pip install -r requirements.txt
```

**5. Train the ML models** *(first time only)*

```bash
cd backend_python
python model_trainer.py
```

This generates `credit_brain.pkl` and `pd_model.pkl`.

---

### Running the Application

You need to run all three services concurrently.

**Terminal 1 — Python ML Engine**

```bash
cd backend_python
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — Node Bridge Server**

```bash
cd backend_node
node server.js
```

**Terminal 3 — React Frontend (Dev Server)**

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 API Reference

### Node.js Server (Port 5000)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze-credit` | Analyze credit from a JSON array of transactions |
| `POST` | `/api/analyze-pdf` | Upload a bank statement PDF for full analysis |
| `POST` | `/api/chat` | Chat with the AI about your financial data |
| `GET` | `/api/reports/:userId` | Retrieve the latest saved credit report for a user |

**`POST /api/analyze-pdf`** — multipart/form-data

| Field | Type | Description |
|---|---|---|
| `file` | File | Bank statement PDF |
| `x-clerk-user-id` | Header | Clerk user ID (optional, enables report saving) |

**`POST /api/analyze-credit`** — application/json

```json
[
  { "description": "SALARY CREDIT", "amount": 75000, "date": "2025-01-01" },
  { "description": "ZOMATO", "amount": -450, "date": "2025-01-03" }
]
```

---

### Python ML Engine (Port 8000)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/get-score` | Run the ML scoring pipeline on a transaction list |

**Request body:**

```json
[
  { "description": "SALARY", "amount": 60000, "date": "2025-01-01" },
  { "description": "DREAM11", "amount": -2000, "date": "2025-01-10" }
]
```

---

## 📁 Project Structure

```
BharatCred/
├── frontend/                   # React + Vite SPA
│   └── src/
│       ├── pages/
│       │   ├── Home.jsx        # Landing page with PDF upload
│       │   └── Results.jsx     # Full credit report dashboard
│       ├── components/
│       │   ├── CreditGauge.jsx # Animated score gauge
│       │   ├── BharatLoading.jsx
│       │   └── ui/             # shadcn/ui component library
│       └── layout/
│           └── Applayout.jsx
│
├── backend_node/               # Express bridge server
│   ├── server.js               # Entry point, routes
│   ├── controllers/
│   │   ├── creditController.js # JSON transaction analysis
│   │   ├── pdfController.js    # PDF upload & pipeline
│   │   └── chatController.js   # AI chat handler
│   ├── services/
│   │   └── openaiService.js    # OpenAI API calls
│   └── models/
│       └── CreditReport.js     # Mongoose schema
│
└── backend_python/             # FastAPI ML engine
    ├── main.py                 # FastAPI app + scoring logic
    ├── model_trainer.py        # Model training script
    ├── master_model.py         # Alternate model reference
    ├── credit_brain.pkl        # Trained RandomForest model
    ├── pd_model.pkl            # Probability of default model
    └── requirements.txt
```

---

## ⚙️ How It Works

### PDF Analysis Pipeline

```
PDF Upload
    │
    ▼
pdfjs-dist extracts raw text from all pages
    │
    ▼
OpenAI GPT parses raw text → structured transactions
[{ description, amount, date }, ...]
    │
    ▼
Python FastAPI /get-score
    ├── NLP keyword categorization (Income / Essential / Leisure / Risky / Investment)
    ├── Monthly aggregation & behavioral metrics
    ├── Logistic Regression → Probability of Default (PD)
    ├── Income-weighted capacity multiplier with stability bonus
    ├── Dynamic score formula (300–900 bounded)
    └── Returns: score + behavioral_insights + ml_diagnostics + market_analysis
    │
    ▼
OpenAI GPT generates a human-readable AI summary
    │
    ▼
Report saved to MongoDB (keyed by Clerk user ID)
    │
    ▼
Results displayed on frontend dashboard
```

---

## 🤖 ML Model Details

### Credit Score Formula

The final score uses a **three-stage calculation** that combines ML prediction with income-based capacity scaling:

**Stage 1: Raw ML Score (350–880)**

$$\text{Raw ML Score} = 350 + \Bigl((1 - P_{\text{default}}) \times 530\Bigr)$$

Where $P_{\text{default}}$ is predicted by a Logistic Regression model trained on `[savings_rate, risky_ratio]`.

**Stage 2: Capacity Multiplier (0.45–1.10)**

$$\text{Capacity Multiplier} = \min\Bigl(0.45 + \frac{\log_{10}(\text{Avg Monthly Income})}{11} + \text{Stability Bonus},\ 1.1\Bigr)$$

**Stability Bonus** (+0.06) is awarded when:
- Risky spending = 0%
- Savings rate > 40%
- Cash usage < 20%

**Stage 3: Final Score (300–900)**

$$\text{Final Score} = \text{clamp}\Bigl(\lfloor\text{Raw ML Score} \times \text{Capacity Multiplier}\rfloor,\ 300,\ 900\Bigr)$$

### Scoring Components

| Component | Impact | Description |
|---|---|---|
| **Probability of Default** | Core driver | Logistic model trained on savings rate & risky spending ratio |
| **Savings Rate** | Indirect (via PD) | Higher savings → lower default probability → higher score |
| **Risky Spending** | Indirect (via PD) | Gambling/betting transactions increase default probability |
| **Monthly Income** | Multiplier (logarithmic) | Higher income → greater capacity multiplier (up to 1.1x) |
| **Cash Usage** | PD Penalty | >30% cash withdrawals increase default probability by up to 25% |
| **Stability Bonus** | +6% multiplier | Elite behavior (0% risky, 40%+ savings, low cash usage) |

### Transaction Categories

| Category | Keywords |
|---|---|
| **Income** | salary, NEFT credit, interest credit, refund, cashback, dividend |
| **Essential** | rent, electricity, groceries, milk, insurance |
| **Investment** | SIP, mutual fund, stocks, LIC |
| **Leisure** | Zomato, Swiggy, PVR, movies, mall |
| **Risky** | Dream11, Rummy, casino, stake, betting sites |