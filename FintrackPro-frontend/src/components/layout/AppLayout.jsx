// src/components/layout/AppLayout.jsx
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NAV_ITEMS = [
  { path: '/dashboard', icon: '⊞', label: 'Dashboard'     },
  { path: '/income',    icon: '↑', label: 'Income'         },
  { path: '/expense',   icon: '↓', label: 'Expenses'       },
  { path: '/budget',    icon: '◎', label: 'Budget'         },
  { path: '/savings',   icon: '◈', label: 'Savings Goals'  },
  { path: '/analytics', icon: '◑', label: 'Analytics'      },
  { path: '/reports',   icon: '≡', label: 'Reports'        },
];

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/income':    'Income Management',
  '/expense':   'Expense Tracker',
  '/budget':    'Budget Planner',
  '/savings':   'Savings Goals',
  '/analytics': 'Financial Analytics',
  '/reports':   'Reports',
  '/profile':   'My Profile',
};

export default function AppLayout() {
  const { user, logout }   = useAuth();
  const { dark, toggle }   = useTheme();
  const navigate           = useNavigate();
  const location           = useLocation();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const pageTitle = PAGE_TITLES[location.pathname] || 'FinTrack Pro';

  return (
    <div className="app-shell">

      {/* ── Mobile backdrop ──────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 40 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}
        style={mobileOpen ? { position: 'fixed', inset: '0 auto 0 0', zIndex: 50 } : {}}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">💹</div>
          {!collapsed && (
            <div className="logo-text">
              Fin<span>Track</span>
              <div style={{ fontSize: 10, fontWeight: 500, opacity: 0.6, letterSpacing: 2 }}>
                PRO
              </div>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="sidebar-nav">
          {!collapsed && <div className="nav-section-title">Main Menu</div>}

          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}

          {!collapsed && (
            <div className="nav-section-title" style={{ marginTop: 16 }}>Account</div>
          )}

          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? 'Profile' : undefined}
          >
            <span className="nav-icon">👤</span>
            {!collapsed && <span>Profile</span>}
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="sidebar-bottom">
          <button
            className="nav-item"
            onClick={logout}
            style={{ color: '#ef4444' }}
            title={collapsed ? 'Logout' : undefined}
          >
            <span className="nav-icon">⏻</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content area ─────────────────────────────────────────── */}
      <div className="main-content">

        {/* Topbar */}
        <header className="topbar">
          {/* Mobile hamburger – shown via CSS on small screens */}
          <button
            className="icon-btn"
            id="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            style={{ display: 'none' }}
          >
            ☰
          </button>

          {/* Desktop sidebar toggle */}
          <button
            className="icon-btn"
            onClick={() => setCollapsed(c => !c)}
            title="Toggle sidebar"
          >
            {collapsed ? '›' : '‹'}
          </button>

          <span className="topbar-title">{pageTitle}</span>

          <div className="topbar-actions">
            {/* Dark-mode toggle */}
            <button className="icon-btn" onClick={toggle} title="Toggle dark mode">
              {dark ? '☀' : '☽'}
            </button>

            {/* Avatar / go to profile */}
            <div
              className="user-avatar"
              onClick={() => navigate('/profile')}
              title={user?.name}
              style={{ cursor: 'pointer' }}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Routed page content */}
        <main className="page-area">
          <Outlet />
        </main>
      </div>

      {/* Responsive sidebar rules */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar:not(.mobile-open) { display: none !important; }
          #mobile-menu-btn           { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
