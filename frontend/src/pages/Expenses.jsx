import React, { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import { Card, EmptyState, Badge } from '../components/Primitives.jsx';
import Table from '../components/Table.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import ExpenseFormModal from '../components/ExpenseFormModal.jsx';
import { fetchExpenses, createExpense, updateExpense, deleteExpense } from '../services/expenseService.js';
import { fetchCategories } from '../services/dashboardService.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { useToast } from '../hooks/useToast.jsx';

const PAGE_SIZE = 10;

export default function Expenses() {
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('expense_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchExpenses({
        search: search || undefined,
        categoryId: categoryFilter || undefined,
        sortBy,
        sortOrder,
        page,
        limit: PAGE_SIZE,
      });
      setItems(result.items);
      setPagination(result.pagination);
    } catch (err) {
      setError('Unable to load expenses right now.');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Debounce search input to avoid firing a request per keystroke.
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  function toggleSort(column) {
    if (sortBy === column) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  }

  function openAddForm() {
    setEditingExpense(null);
    setFormOpen(true);
  }

  function openEditForm(expense) {
    setEditingExpense(expense);
    setFormOpen(true);
  }

  async function handleFormSubmit(payload) {
    setFormLoading(true);
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, payload);
        showToast('Expense updated.', { type: 'success' });
      } else {
        await createExpense(payload);
        showToast('Expense added.', { type: 'success' });
      }
      setFormOpen(false);
      await load();
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteExpense(deleteTarget.id);
      showToast('Expense deleted.', { type: 'success' });
      setDeleteTarget(null);
      // Deleting an expense should update subsequent aggregates; a fresh
      // load ensures pagination/totals reflect the change immediately.
      await load();
    } catch (err) {
      showToast('Unable to delete this expense.', { type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns = [
    {
      key: 'title',
      header: <SortHeader label="Title" column="title" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />,
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.title}</p>
          {row.description && <p className="text-xs text-slate-500 truncate max-w-xs">{row.description}</p>}
        </div>
      ),
    },
    { key: 'category_name', header: 'Category', render: (row) => <Badge tone="neutral">{row.category_name}</Badge> },
    {
      key: 'expense_date',
      header: <SortHeader label="Date" column="expense_date" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />,
      render: (row) => formatDate(row.expense_date),
    },
    {
      key: 'amount',
      header: <SortHeader label="Amount" column="amount" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />,
      render: (row) => <span className="font-semibold text-slate-900">{formatCurrency(row.amount)}</span>,
      className: 'text-right',
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => openEditForm(row)}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 px-2 py-1 rounded-md hover:bg-brand-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="text-xs font-medium text-red-600 hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Expenses">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <Input
            placeholder="Search expenses..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="sm:max-w-xs"
            aria-label="Search expenses"
          />
          <Select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            placeholder="All categories"
            options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
            className="sm:max-w-[200px]"
            aria-label="Filter by category"
          />
        </div>
        <Button onClick={openAddForm}>+ Add expense</Button>
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
          emptyState={
            <EmptyState
              title={search || categoryFilter ? 'No matching expenses' : 'No expenses yet'}
              description={search || categoryFilter ? 'Try adjusting your search or filters.' : 'Add your first expense to start tracking.'}
              action={!search && !categoryFilter && <Button onClick={openAddForm}>+ Add expense</Button>}
            />
          }
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

      <ExpenseFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        categories={categories}
        initialValue={editingExpense}
        loading={formLoading}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete expense"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </DashboardLayout>
  );
}

function SortHeader({ label, column, sortBy, sortOrder, onSort }) {
  const active = sortBy === column;
  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className={`inline-flex items-center gap-1 font-medium ${active ? 'text-brand-700' : 'text-slate-500'}`}
    >
      {label}
      {active && <span aria-hidden="true">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
    </button>
  );
}
