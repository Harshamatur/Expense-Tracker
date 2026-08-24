import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import { Card, StatCard, Skeleton, EmptyState, Badge } from '../components/Primitives.jsx';
import { fetchDashboardSummary, fetchCategorySummary, fetchMonthlySummary } from '../services/dashboardService.js';
import { formatCurrency, formatDate, formatMonthLabel, MONTH_NAMES } from '../utils/format.js';
import { useToast } from '../hooks/useToast.jsx';

const PIE_COLORS = ['#4f46e5', '#818cf8', '#a5b4fc', '#f59e0b', '#10b981', '#f43f5e', '#0ea5e9', '#8b5cf6'];

export default function Dashboard() {
  const { showToast } = useToast();
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [s, c, m] = await Promise.all([fetchDashboardSummary(), fetchCategorySummary(), fetchMonthlySummary()]);
        if (cancelled) return;
        setSummary(s);
        setCategoryData(c);
        setMonthlyData(m.map((row) => ({ ...row, label: formatMonthLabel(row.month) })));
      } catch (err) {
        if (!cancelled) setError('Unable to load your dashboard right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const monthLabel = summary ? `${MONTH_NAMES[summary.month - 1]} ${summary.year}` : '';

  return (
    <DashboardLayout title="Dashboard">
      {error && (
        <div role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">Showing data for {monthLabel}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard label="Monthly Budget" value={formatCurrency(summary.budget)} />
            <StatCard label="Spent" value={formatCurrency(summary.spent)} />
            <StatCard
              label="Remaining"
              value={formatCurrency(summary.remaining)}
              tone={summary.isOverBudget ? 'danger' : 'success'}
              sublabel={summary.isOverBudget ? 'Over budget' : undefined}
            />
            <StatCard label="Transactions" value={summary.transactionCount} />
          </div>

          {summary.budget > 0 && (
            <Card className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-700">Budget utilization</h3>
                <span className="text-sm font-semibold text-slate-900">
                  {summary.utilizationPercent}%{summary.isOverBudget && <Badge tone="danger" className="ml-2">Overspending</Badge>}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${summary.isOverBudget ? 'bg-red-500' : 'bg-brand-500'}`}
                  style={{ width: `${Math.min(summary.utilizationPercent, 100)}%` }}
                />
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card>
              <h3 className="text-sm font-medium text-slate-700 mb-3">Spending by category</h3>
              {categoryData.length === 0 ? (
                <EmptyState title="No expenses yet" description="Add an expense to see your category breakdown." />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="total" nameKey="category_name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {categoryData.map((entry, i) => (
                        <Cell key={entry.category_id} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {categoryData.length > 0 && (
                <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600">
                  {categoryData.map((c, i) => (
                    <li key={c.category_id} className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="truncate">{c.category_name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <h3 className="text-sm font-medium text-slate-700 mb-3">Monthly trend</h3>
              {monthlyData.length === 0 ? (
                <EmptyState title="No trend data yet" description="Your monthly spending trend will appear here." />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" width={60} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          <Card>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Recent transactions</h3>
            {summary.recentExpenses.length === 0 ? (
              <EmptyState title="No transactions yet" description="Your most recent expenses will show up here." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {summary.recentExpenses.map((tx) => (
                  <li key={tx.id} className="flex items-center justify-between py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{tx.title}</p>
                      <p className="text-xs text-slate-500">
                        {tx.category_name} · {formatDate(tx.expense_date)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 shrink-0 ml-3">{formatCurrency(tx.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
