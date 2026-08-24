import api from './api';

export async function fetchAdminStats() {
  const { data } = await api.get('/admin/stats');
  return data.data;
}

export async function fetchAdminUsers(params) {
  const { data } = await api.get('/admin/users', { params });
  return data.data; // { items, pagination }
}

export async function updateUserStatus(id, status) {
  const { data } = await api.patch(`/admin/users/${id}/status`, { status });
  return data.data.user;
}
