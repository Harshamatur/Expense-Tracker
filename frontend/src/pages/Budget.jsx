import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import { Card, Badge, Skeleton } from '../components/Primitives.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { fetchCurrentBudget, createBudget, updateBudget } from '../services/budgetService.js';
import { fetchDashboardSummary } from '../services/dashboardService.js';
import { formatCurrency, MONTH_NAMES } from '../utils/format.js';
import { useToast } from '../hooks/useToast.jsx';

export default function Budget() {
  const { showToast } = useToast();
  const [budget, setBudget] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const now = new Date();

  async function load() {
    setLoading(true);
    try {
      const [b, s] = await Promise.all([fetchCurrentBudget(), fetchDashboardSummary()]);
      setBudget(b);
      setSummary(s);
      setAmount(b ? String(b.amount) : '');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    const num = Number(amount);
    if (!amount || Number.isNaN(num) || num <= 0) {
      setError('Enter a budget amount greater than 0.');
      return;
    }

    setSaving(true);
    try {
      if (budget) {
        await updateBudget(budget.id, { amount: num });
      } else {
        await createBudget({ month: now.getMonth() + 1, year: now.getFullYear(), amount: num });
      }
      showToast('Budget saved.', { type: 'success' });
      setEditing(false);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save your budget.');
    } finally {
      setSaving(false);
    }
  }

  const utilization = summary?.utilizationPercent;
  const isOver = summary?.isOverBudget;

  return (
    <DashboardLayout title="Budget">
      {loading ? (
        <Skeleton className="h-56 w-full max-w-xl" />
      ) : (
        <Card className="max-w-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-500">
              {MONTH_NAMES[now.getMonth()]} {now.getFullYear()} budget
            </h2>
            {!editing && (
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                {budget ? 'Edit budget' : 'Set budget'}
              </Button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Monthly budget amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                error={error}
                autoFocus
              />
              <div className="flex gap-2">
                <Button type="submit" loading={saving}>
                  Save budget
                </Button>
                <Button type="button" variant="secondary" onClick={() => { setEditing(false); setError(''); setAmount(budget ? String(budget.amount) : ''); }}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : budget ? (
            <div>
              <p className="text-3xl font-semibold text-slate-900">{formatCurrency(budget.amount)}</p>
              <div className="mt-5">
                <div className="flex items-center justify-between mb-1.5 text-sm">
                  <span className="text-slate-600">
                    Spent {formatCurrency(summary.spent)} of {formatCurrency(budget.amount)}
                  </span>
                  <span className={`font-semibold ${isOver ? 'text-red-600' : 'text-slate-800'}`}>{utilization}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isOver ? 'bg-red-500' : 'bg-brand-500'}`}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  />
                </div>
                {isOver && (
                  <div className="mt-3">
                    <Badge tone="danger">Overspending by {formatCurrency(Math.abs(summary.remaining))}</Badge>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500 mb-4">You haven't set a budget for this month yet.</p>
              <Button onClick={() => setEditing(true)}>Set your first budget</Button>
            </div>
          )}
        </Card>
      )}
    </DashboardLayout>
  );
}
