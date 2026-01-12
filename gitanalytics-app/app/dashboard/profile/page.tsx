'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { useQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '@/lib/graphql/queries';

export default function ProfilePage() {
  const { user } = useAuth();

  const { data, loading } = useQuery(GET_CURRENT_USER, {
    skip: !user?.id,
    variables: { userId: user?.id },
  });

  if (loading) {
    return <div>Loading profile...</div>;
  }

  const userData = data?.users?.[0] || user;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="text-gray-900">{userData?.email}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <div className="text-gray-900">{userData?.full_name || 'Not set'}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User ID
          </label>
          <div className="text-gray-900 font-mono text-sm">{userData?.id}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company ID
          </label>
          <div className="text-gray-900 font-mono text-sm">{userData?.company_id}</div>
        </div>

        {userData?.company && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <div className="text-gray-900">{userData.company.name}</div>
          </div>
        )}
      </div>
    </div>
  );
}

