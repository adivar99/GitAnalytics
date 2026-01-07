'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_MANAGED_PROJECTS } from '@/lib/graphql/queries';
import { useAuth } from '@/app/hooks/useAuth';
import { ProjectList } from '@/components/projects/ProjectList';
import Link from 'next/link';

export function ManagerView() {
  const { user } = useAuth();

  const { data, loading } = useQuery(GET_MANAGED_PROJECTS, {
    variables: { managerId: user?.id },
    skip: !user?.id,
  });

  if (loading) {
    return <div>Loading projects...</div>;
  }

  const projects = data?.projects || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">My Projects</h2>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">You don't have any projects yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
              {project.description && (
                <p className="text-gray-600 text-sm mb-4">{project.description}</p>
              )}
              <div className="text-sm text-gray-500">
                Created: {new Date(project.created_at).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Project Health Overview</h3>
        <p className="text-gray-600">Project health metrics will be displayed here.</p>
      </div>
    </div>
  );
}

