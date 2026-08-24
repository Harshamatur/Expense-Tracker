import React from 'react';

export default function Logo({ size = 28, showWordmark = true, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="fill-brand-600" />
        <path d="M8 9L15 23L16.5 23L22 9" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M15.5 19L19 9" stroke="#c7d2fe" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      {showWordmark && <span className="text-lg font-bold tracking-tight text-slate-900">Veyra</span>}
    </div>
  );
}
