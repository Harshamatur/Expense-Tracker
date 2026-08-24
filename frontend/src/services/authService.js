import api from './api';

export async function registerRequest({ name, email, password, confirmPassword }) {
  const { data } = await api.post('/auth/register', { name, email, password, confirmPassword });
  return data.data; // { user, token }
}

export async function loginRequest({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data; // { user, token }
}

export async function meRequest() {
  const { data } = await api.get('/auth/me');
  return data.data.user;
}

export async function logoutRequest() {
  try {
    await api.post('/auth/logout');
  } catch {
    // Best-effort only — client-side token clear happens regardless.
  }
}
