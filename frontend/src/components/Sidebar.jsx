import React from 'react';
import { NavLink } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../hooks/useAuth.js';

const consumerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/expenses', label: 'Expenses', icon: ExpensesIcon },
  { to: '/budget', label: 'Budget', icon: BudgetIcon },
  { to: '/profile', label: 'Profile', icon: ProfileIcon },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Admin Dashboard', icon: DashboardIcon },
  { to: '/admin/users', label: 'Users', icon: UsersIcon },
  { to: '/profile', label: 'Profile', icon: ProfileIcon },
];

function DashboardIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}
function ExpensesIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5h16M4 12h16M4 19h10" strokeLinecap="round" />
    </svg>
  );
}
function BudgetIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ProfileIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0115 0" strokeLinecap="round" />
    </svg>
  );
}
function UsersIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" />
      <path d="M2.5 20a6.5 6.5 0 0113 0M16 8a3 3 0 110 6M15 14.5c3 .3 5.5 2.3 5.5 5.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { isAdmin } = useAuth();
  const links = isAdmin ? adminLinks : consumerLinks;

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onCloseMobile} aria-hidden="true" />
      )}
      <aside
        className={`fixed lg:sticky top-0 z-30 h-screen w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-5 border-b border-slate-100">
          <Logo />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} onClick={onCloseMobile}>
              <link.icon className="w-5 h-5 shrink-0" />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 text-xs text-slate-400 border-t border-slate-100">Veyra Phase 1</div>
      </aside>
    </>
  );
}
