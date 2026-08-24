import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import { Card, StatCard, Skeleton, EmptyState } from '../components/Primitives.jsx';
import { fetchAdminStats } from '../services/adminService.js';
import { formatCurrency } from '../utils/format.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchAdminStats();
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) setError('Unable to load system statistics right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardLayout title="Admin Dashboard">
      {error && (
        <div role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Users" value={stats.totalUsers} />
              <StatCard label="Active Users" value={stats.activeUsers} sublabel={`${stats.inactiveUsers} inactive`} />
              <StatCard label="Total Transactions" value={stats.totalTransactions} />
              <StatCard label="Total Spend" value={formatCurrency(stats.totalSpend)} />
            </div>

            <Card>
              <h3 className="text-sm font-medium text-slate-700 mb-3">System-wide category spend</h3>
              {stats.categoryBreakdown.length === 0 ? (
                <EmptyState title="No data yet" description="System-wide spending by category will appear here." />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.categoryBreakdown} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis type="category" dataKey="category_name" width={130} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="total" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </>
        )
      )}
    </DashboardLayout>
  );
}
