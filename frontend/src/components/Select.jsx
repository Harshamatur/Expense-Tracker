import React, { useId } from 'react';

export default function Select({ label, error, options = [], placeholder, className = '', id, ...props }) {
  const autoId = useId();
  const selectId = id || autoId;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${selectId}-error` : undefined}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 ${
          error ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
        }`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
