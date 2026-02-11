'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { useQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '@/lib/graphql/queries';

export default function SettingsPage() {
  const { user } = useAuth();

  const { data, loading } = useQuery(GET_CURRENT_USER, {
    skip: !user?.id,
    variables: { userId: user?.id },
  });

  const userData = data?.users?.[0] || user;

  if (loading) {
    return <div>Loading settings...</div>;
  }

  // Check if user is admin
  const isAdmin = userData?.company?.admin_user_id === user?.id;

  if (!isAdmin) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">You need admin access to view settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Company Settings</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <div className="text-gray-900">{userData?.company?.name}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            License Key
          </label>
          <div className="text-gray-900 font-mono text-sm">{userData?.company?.license_key}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Projects
          </label>
          <div className="text-gray-900">{userData?.company?.max_projects}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company ID
          </label>
          <div className="text-gray-900 font-mono text-sm">{userData?.company?.id}</div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-lg font-semibold mb-4">User Management</h3>
          <p className="text-gray-600 text-sm">
            User management features will be available here. You can add users to your company,
            manage their roles, and view company statistics.
          </p>
        </div>
      </div>
    </div>
  );
}

