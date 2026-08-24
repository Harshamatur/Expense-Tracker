import api from './api';

export async function fetchDashboardSummary() {
  const { data } = await api.get('/dashboard/summary');
  return data.data;
}

export async function fetchCategorySummary() {
  const { data } = await api.get('/dashboard/category-summary');
  return data.data.breakdown;
}

export async function fetchMonthlySummary() {
  const { data } = await api.get('/dashboard/monthly-summary');
  return data.data.trend;
}

export async function fetchCategories() {
  const { data } = await api.get('/categories');
  return data.data.categories;
}
