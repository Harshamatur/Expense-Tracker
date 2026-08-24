import React from 'react';
import { Skeleton } from './Primitives.jsx';

/**
 * columns: [{ key, header, render?(row), className? }]
 */
export default function Table({ columns, rows, loading, rowKey = 'id', emptyState }) {
  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return emptyState || null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 font-medium text-slate-500 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 text-slate-700 ${col.className || ''}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
