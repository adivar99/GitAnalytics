'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_COMPANY_PROJECTS } from '@/lib/graphql/queries';
import { useAuth } from '@/app/hooks/useAuth';
import { ProjectList } from '@/components/projects/ProjectList';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';

export function AdminView() {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, loading, refetch } = useQuery(GET_COMPANY_PROJECTS, {
    variables: { companyId: user?.company_id },
    skip: !user?.company_id,
  });

  if (loading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Company Projects</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add Project
        </button>
      </div>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}

      <ProjectList
        projects={data?.projects || []}
        onProjectDeleted={() => refetch()}
      />

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Users Management</h3>
        <p className="text-gray-600">User management table will be displayed here.</p>
      </div>
    </div>
  );
}

