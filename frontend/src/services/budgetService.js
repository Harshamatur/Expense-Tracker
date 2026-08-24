import api from './api';

export async function fetchCurrentBudget() {
  const { data } = await api.get('/budgets/current');
  return data.data.budget;
}

export async function createBudget(payload) {
  const { data } = await api.post('/budgets', payload);
  return data.data.budget;
}

export async function updateBudget(id, payload) {
  const { data } = await api.put(`/budgets/${id}`, payload);
  return data.data.budget;
}
