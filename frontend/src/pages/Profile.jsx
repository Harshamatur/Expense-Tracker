import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import { Card, Badge } from '../components/Primitives.jsx';
import Button from '../components/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { formatDate } from '../utils/format.js';

export default function Profile() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <DashboardLayout title="Profile">
      <Card className="max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-700 text-lg font-semibold flex items-center justify-center">
            {(user?.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">{user?.name}</p>
            <Badge tone={isAdmin ? 'brand' : 'neutral'}>{isAdmin ? 'Admin' : 'Consumer'}</Badge>
          </div>
        </div>

        <dl className="space-y-3 text-sm border-t border-slate-100 pt-4">
          <div className="flex justify-between">
            <dt className="text-slate-500">Email</dt>
            <dd className="text-slate-800 font-medium">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Account status</dt>
            <dd>
              <Badge tone="success">Active</Badge>
            </dd>
          </div>
          {user?.created_at && (
            <div className="flex justify-between">
              <dt className="text-slate-500">Member since</dt>
              <dd className="text-slate-800 font-medium">{formatDate(user.created_at)}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6 pt-4 border-t border-slate-100">
          <Button variant="danger" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </Card>
    </DashboardLayout>
  );
}
