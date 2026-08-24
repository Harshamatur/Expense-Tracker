import React, { useId } from 'react';

export default function Input({ label, error, hint, className = '', id, type = 'text', ...props }) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 ${
          error ? 'border-red-400 bg-red-50/40' : 'border-slate-300 bg-white'
        }`}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}
