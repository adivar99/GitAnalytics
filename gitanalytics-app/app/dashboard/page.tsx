'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { UnifiedDashboard } from '@/components/dashboard/UnifiedDashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <UnifiedDashboard />
    </div>
  );
}

