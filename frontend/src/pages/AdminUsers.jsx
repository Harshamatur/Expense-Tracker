import React, { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import { Card, EmptyState, Badge } from '../components/Primitives.jsx';
import Table from '../components/Table.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { fetchAdminUsers, updateUserStatus } from '../services/adminService.js';
import { formatDate } from '../utils/format.js';
import { useToast } from '../hooks/useToast.jsx';
import { useAuth } from '../hooks/useAuth.js';

const PAGE_SIZE = 10;

export default function AdminUsers() {
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [confirmTarget, setConfirmTarget] = useState(null); // { user, nextStatus }
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchAdminUsers({ search: search || undefined, page, limit: PAGE_SIZE });
      setItems(result.items);
      setPagination(result.pagination);
    } catch {
      setError('Unable to load users right now.');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleConfirmToggle() {
    if (!confirmTarget) return;
    setActionLoading(true);
    try {
      await updateUserStatus(confirmTarget.user.id, confirmTarget.nextStatus);
      showToast(`User ${confirmTarget.nextStatus === 'active' ? 'activated' : 'deactivated'}.`, { type: 'success' });
      setConfirmTarget(null);
      await load();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Unable to update this user.', { type: 'error' });
    } finally {
      setActionLoading(false);
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (row) => <Badge tone={row.role === 'admin' ? 'brand' : 'neutral'}>{row.role}</Badge> },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge tone={row.status === 'active' ? 'success' : 'danger'}>{row.status}</Badge>,
    },
    { key: 'created_at', header: 'Joined', render: (row) => formatDate(row.created_at) },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => {
        const isSelf = currentUser && Number(currentUser.id) === Number(row.id);
        const nextStatus = row.status === 'active' ? 'inactive' : 'active';
        return (
          <button
            type="button"
            disabled={isSelf}
            onClick={() => setConfirmTarget({ user: row, nextStatus })}
            className={`text-xs font-medium px-2.5 py-1 rounded-md ${
              isSelf
                ? 'text-slate-300 cursor-not-allowed'
                : nextStatus === 'active'
                ? 'text-emerald-700 hover:bg-emerald-50'
                : 'text-red-600 hover:bg-red-50'
            }`}
            title={isSelf ? 'You cannot change your own status' : undefined}
          >
            {nextStatus === 'active' ? 'Activate' : 'Deactivate'}
          </button>
        );
      },
    },
  ];

  return (
    <DashboardLayout title="Users">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <Input
          placeholder="Search by name or email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="sm:max-w-xs"
          aria-label="Search users"
        />
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        <Table
          columns={columns}
          rows={items}
          loading={loading}
          emptyState={<EmptyState title="No users found" description="Try a different search term." />}
        />
      </Card>

      {!loading && items.length > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
          <span>
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmToggle}
        title={confirmTarget?.nextStatus === 'active' ? 'Activate user' : 'Deactivate user'}
        message={
          confirmTarget?.nextStatus === 'active'
            ? `Reactivate ${confirmTarget?.user.name}? They will be able to log in again.`
            : `Deactivate ${confirmTarget?.user.name}? They will be immediately signed out and unable to log in.`
        }
        confirmLabel={confirmTarget?.nextStatus === 'active' ? 'Activate' : 'Deactivate'}
        variant={confirmTarget?.nextStatus === 'active' ? 'primary' : 'danger'}
        loading={actionLoading}
      />
    </DashboardLayout>
  );
}
