'use client';

import { useQuery } from '@apollo/client';
import { GET_COMPANY_PROJECTS, GET_MANAGED_PROJECTS, GET_MEMBER_PROJECTS } from '@/lib/graphql/queries';
import { useAuth } from '@/app/hooks/useAuth';
import { AdminView } from '@/components/dashboard/AdminView';
import { ManagerView } from '@/components/dashboard/ManagerView';
import { DeveloperView } from '@/components/dashboard/DeveloperView';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'developer' | null>(null);

  useEffect(() => {
    // Determine user role based on JWT claims or database query
    // For now, we'll use a simple check - in production, decode JWT or query Hasura
    // This is a simplified version - you should decode the JWT token to get roles
    setUserRole('admin'); // Placeholder - should be determined from JWT or Hasura query
  }, [user]);

  if (!user || !userRole) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      {userRole === 'admin' && <AdminView />}
      {userRole === 'manager' && <ManagerView />}
      {userRole === 'developer' && <DeveloperView />}
    </div>
  );
}

