import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
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
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!form.email.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (!form.password) next.password = 'Password is required.';
    else if (form.password.length < 8) next.password = 'Password must be at least 8 characters.';
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await register(form);
      showToast('Account created — welcome to Veyra!', { type: 'success' });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to create your account. Please try again.';
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start tracking expenses in minutes">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input label="Full name" name="name" autoComplete="name" value={form.name} onChange={handleChange} error={errors.name} placeholder="Jane Doe" />
        <Input label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" />
        <Input label="Password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} error={errors.password} hint="At least 8 characters." />
        <Input label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />

        {submitError && (
          <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <Button type="submit" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
