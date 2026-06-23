# FinTrack Pro – Frontend Setup

## Tech Stack
- React 18, React Router v6
- Axios (API calls + JWT interceptors)
- Chart.js + react-chartjs-2
- jsPDF + jspdf-autotable (PDF reports)
- react-hot-toast (notifications)
- Google Fonts: Syne + DM Sans

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server (proxies /api to localhost:8080)
npm start
```

Open http://localhost:3000

## Folder Structure

```
src/
├── App.jsx                    # Root with routing & lazy loading
├── index.js                   # React DOM entry
├── index.css                  # Full design system (vars, dark mode, components)
│
├── context/
│   ├── AuthContext.jsx        # JWT auth state + login/register/logout
│   └── ThemeContext.jsx       # Dark/light mode toggle
│
├── services/
│   └── api.js                 # Axios instance + all API modules
│
├── utils/
│   └── format.js              # Currency, date, category helpers
│
├── components/
│   └── layout/
│       └── AppLayout.jsx      # Sidebar + Topbar shell
│
└── pages/
    ├── Login.jsx              # Auth – login
    ├── Register.jsx           # Auth – register
    ├── Dashboard.jsx          # Overview stats + recent transactions
    ├── IncomePage.jsx         # CRUD income with pagination
    ├── ExpensePage.jsx        # CRUD expenses + filter/search
    ├── BudgetPage.jsx         # Monthly budget with progress
    ├── SavingsPage.jsx        # Goals with contribution tracking
    ├── Analytics.jsx          # Chart.js: Pie, Bar, Line charts
    ├── Reports.jsx            # Transaction history + PDF export
    └── Profile.jsx            # Account settings
```

## Environment / Proxy
The `proxy` field in `package.json` forwards `/api` requests to
`http://localhost:8080/api` (Spring Boot backend).

For production set `REACT_APP_API_URL` and update the axios baseURL.

## Features
- ✅ JWT auth with protected routes
- ✅ Dark mode (persisted in localStorage)
- ✅ Responsive sidebar (collapsible + mobile drawer)
- ✅ Income & Expense CRUD with pagination
- ✅ Expense filtering by category, date range, search
- ✅ Budget planner with visual progress + alerts
- ✅ Savings goals with contribution tracking
- ✅ Analytics dashboard (Pie / Bar / Line charts)
- ✅ Monthly reports with PDF download
- ✅ Profile management with currency selection
