import React, { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import Input from './Input.jsx';
import Select from './Select.jsx';
import Button from './Button.jsx';

const emptyForm = { title: '', amount: '', categoryId: '', expenseDate: '', description: '' };

export default function ExpenseFormModal({ open, onClose, onSubmit, categories, initialValue, loading }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(
        initialValue
          ? {
              title: initialValue.title,
              amount: String(initialValue.amount),
              categoryId: String(initialValue.category_id),
              expenseDate: initialValue.expense_date,
              description: initialValue.description || '',
            }
          : emptyForm
      );
      setErrors({});
      setSubmitError('');
    }
  }, [open, initialValue]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    const amountNum = Number(form.amount);
    if (!form.amount || Number.isNaN(amountNum) || amountNum <= 0) next.amount = 'Enter an amount greater than 0.';
    if (!form.categoryId) next.categoryId = 'Select a category.';
    if (!form.expenseDate) next.expenseDate = 'Select a date.';
    if (form.description && form.description.length > 500) next.description = 'Description is too long.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    try {
      await onSubmit({
        title: form.title.trim(),
        amount: Number(form.amount),
        categoryId: Number(form.categoryId),
        expenseDate: form.expenseDate,
        description: form.description.trim() || undefined,
      });
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Unable to save this expense.');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initialValue ? 'Edit expense' : 'Add expense'}>
      <form id="expense-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input label="Title" name="title" value={form.title} onChange={handleChange} error={errors.title} placeholder="e.g. Grocery shopping" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Amount" name="amount" type="number" step="0.01" min="0.01" value={form.amount} onChange={handleChange} error={errors.amount} placeholder="0.00" />
          <Input label="Date" name="expenseDate" type="date" value={form.expenseDate} onChange={handleChange} error={errors.expenseDate} />
        </div>
        <Select
          label="Category"
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          error={errors.categoryId}
          placeholder="Select a category"
          options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
        />
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">
            Description <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            value={form.description}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-brand-500"
            placeholder="Add a note..."
          />
          {errors.description && <p className="mt-1.5 text-sm text-red-600">{errors.description}</p>}
        </div>

        {submitError && (
          <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {submitError}
          </div>
        )}
      </form>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" form="expense-form" loading={loading}>
          {initialValue ? 'Save changes' : 'Add expense'}
        </Button>
      </div>
    </Modal>
  );
}
