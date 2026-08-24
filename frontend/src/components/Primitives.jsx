import React from 'react';

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`card p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, sublabel, tone = 'default', icon }) {
  const toneClasses = {
    default: 'text-slate-900',
    danger: 'text-red-600',
    success: 'text-emerald-600',
  };
  return (
    <Card className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <span className={`text-2xl font-semibold ${toneClasses[tone]}`}>{value}</span>
      {sublabel && <span className="text-xs text-slate-500">{sublabel}</span>}
    </Card>
  );
}

export function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    danger: 'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
    brand: 'bg-brand-100 text-brand-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-slate-400">
          <path d="M3 12h4l3 8 4-16 3 8h4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;
}
