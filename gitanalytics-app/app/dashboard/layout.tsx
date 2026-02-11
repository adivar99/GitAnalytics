'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/app/hooks/useAuth';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '@/lib/graphql/queries';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const { data: userData, loading } = useQuery(GET_CURRENT_USER, {
    skip: !user?.id,
    variables: { userId: user?.id },
  });


  if (loading) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
          <div className="flex flex-col h-full">
            <div className="p-6">
              <h1 className="text-2xl font-bold">GitAnalytics</h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
              <Link
                href="/dashboard"
                className={`block px-4 py-2 rounded ${pathname === '/dashboard'
                  ? 'bg-gray-800'
                  : 'hover:bg-gray-800'
                  }`}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                className={`block px-4 py-2 rounded ${pathname === '/dashboard/profile'
                  ? 'bg-gray-800'
                  : 'hover:bg-gray-800'
                  }`}
              >
                Profile
              </Link>
              {userData?.users?.[0]?.company?.admin_user_id === user?.id && (
                <Link
                  href="/dashboard/userManagement"
                  className={`block px-4 py-2 rounded ${pathname === '/dashboard/userManagement'
                    ? 'bg-gray-800'
                    : 'hover:bg-gray-800'
                    }`}
                >
                  User Management
                </Link>
              )}
              {user && (
                <Link
                  href="/dashboard/settings"
                  className={`block px-4 py-2 rounded ${pathname === '/dashboard/settings'
                    ? 'bg-gray-800'
                    : 'hover:bg-gray-800'
                    }`}
                >
                  Settings
                </Link>
              )}
            </nav>
            <div className="p-4 border-t border-gray-800">
              <div className="mb-2 text-sm text-gray-400">{user?.email}</div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-800 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="ml-64">
          <div className="p-8">{children}</div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

