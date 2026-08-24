import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.jsx';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.email.trim()) next.email = 'Email is required.';
    if (!form.password) next.password = 'Password is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const loggedInUser = await login(form);
      const redirectTo = location.state?.from?.pathname || (loggedInUser.role === 'admin' ? '/admin/dashboard' : '/dashboard');
      showToast('Welcome back!', { type: 'success' });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to log in. Please try again.';
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your Veyra account">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="you@example.com"
        />
        <div>
          <div className="relative">
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-[34px] text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {submitError && (
          <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <Button type="submit" className="w-full" loading={loading}>
          Log in
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
