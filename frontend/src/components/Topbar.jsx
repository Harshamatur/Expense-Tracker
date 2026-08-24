import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from './Primitives.jsx';
import { useAuth } from '../hooks/useAuth.js';

export default function Topbar({ title, onOpenMobileSidebar }) {
  const { user, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur px-4 sm:px-6 py-3.5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 -ml-2 rounded-md text-slate-500 hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-full pl-1 pr-3 py-1 hover:bg-slate-100"
          aria-haspopup="true"
          aria-expanded={menuOpen}
        >
          <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center justify-center">
            {initials}
          </span>
          <span className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-sm font-medium text-slate-800">{user?.name}</span>
          </span>
          <Badge tone={isAdmin ? 'brand' : 'neutral'}>{isAdmin ? 'Admin' : 'Consumer'}</Badge>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-44 rounded-lg border border-slate-200 bg-white shadow-lg py-1" role="menu">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                navigate('/profile');
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              role="menuitem"
            >
              Profile
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              role="menuitem"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
