// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './components/layout/AppLayout';
import './index.css';

// ── Lazy-loaded pages ──────────────────────────────────────────────────────
const Login       = lazy(() => import('./pages/Login'));
const Register    = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const VerifyOtp      = lazy(() => import('./pages/VerifyOtp'));
const ResetPassword  = lazy(() => import('./pages/ResetPassword'));
const Dashboard   = lazy(() => import('./pages/Dashboard'));
const IncomePage  = lazy(() => import('./pages/IncomePage'));
const ExpensePage = lazy(() => import('./pages/ExpensePage'));
const BudgetPage  = lazy(() => import('./pages/BudgetPage'));
const SavingsPage = lazy(() => import('./pages/SavingsPage'));
const Analytics   = lazy(() => import('./pages/Analytics'));
const Reports     = lazy(() => import('./pages/Reports'));
const Profile     = lazy(() => import('./pages/Profile'));

// ── Full-screen loader shown during lazy chunk download ────────────────────
const PageLoader = () => (
  <div className="page-loader">
    <div className="loader-ring">
      <div /><div /><div /><div />
    </div>
  </div>
);

// ── Route guards (MUST be inside AuthProvider) ─────────────────────────────
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
};

// ── All routes ─────────────────────────────────────────────────────────────
// FIX: AppRoutes must be INSIDE AuthProvider so PrivateRoute / PublicRoute
//      can call useAuth() without throwing "must be used within AuthProvider".
function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/verify-otp"      element={<PublicRoute><VerifyOtp /></PublicRoute>} />
        <Route path="/reset-password"  element={<PublicRoute><ResetPassword /></PublicRoute>} />

        {/* Protected routes – all share the AppLayout shell */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route index                element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"     element={<Dashboard />} />
          <Route path="income"        element={<IncomePage />} />
          <Route path="expense"       element={<ExpensePage />} />
          <Route path="budget"        element={<BudgetPage />} />
          <Route path="savings"       element={<SavingsPage />} />
          <Route path="analytics"     element={<Analytics />} />
          <Route path="reports"       element={<Reports />} />
          <Route path="profile"       element={<Profile />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

// ── Root component ─────────────────────────────────────────────────────────
// FIX: Provider order matters:
//   ThemeProvider → AuthProvider → BrowserRouter → AppRoutes
// BrowserRouter wraps AppRoutes so Navigate/useNavigate work.
// Toaster is outside AppRoutes but inside BrowserRouter – correct.
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style:   { borderRadius: '12px', fontSize: '14px' },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );

}
