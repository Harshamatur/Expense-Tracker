import api from './api';

export async function fetchExpenses(params) {
  const { data } = await api.get('/expenses', { params });
  return data.data; // { items, pagination }
}

export async function fetchExpense(id) {
  const { data } = await api.get(`/expenses/${id}`);
  return data.data.expense;
}

export async function createExpense(payload) {
  const { data } = await api.post('/expenses', payload);
  return data.data.expense;
}

export async function updateExpense(id, payload) {
  const { data } = await api.put(`/expenses/${id}`, payload);
  return data.data.expense;
}

export async function deleteExpense(id) {
  await api.delete(`/expenses/${id}`);
}
