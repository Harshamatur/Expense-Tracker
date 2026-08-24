import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import Button from '../components/Button.jsx';

export default function Forbidden() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <Logo size={32} className="mb-8" />
      <p className="text-6xl font-bold text-slate-200 mb-2">403</p>
      <h1 className="text-lg font-semibold text-slate-900">Access forbidden</h1>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">You don't have permission to view this page.</p>
      <Link to="/dashboard" className="mt-6">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
