'use client';

import { useQuery } from '@apollo/client';
import { GET_MEMBER_PROJECTS } from '@/lib/graphql/queries';
import { useAuth } from '@/app/hooks/useAuth';
import Link from 'next/link';

export function DeveloperView() {
  const { user } = useAuth();

  const { data, loading } = useQuery(GET_MEMBER_PROJECTS, {
    variables: { userId: user?.id },
    skip: !user?.id,
  });

  if (loading) {
    return <div>Loading projects...</div>;
  }

  const projects = data?.project_members?.map((pm: any) => pm.project) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">My Contributions</h2>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Assigned Projects</h3>
        {projects.length === 0 ? (
          <p className="text-gray-600">You are not assigned to any projects yet.</p>
        ) : (
          <div className="space-y-4">
            {projects.map((project: any) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="block p-4 border rounded-lg hover:bg-gray-50"
              >
                <h4 className="font-semibold">{project.name}</h4>
                {project.description && (
                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Personal Analytics</h3>
        <p className="text-gray-600">Your personal contribution statistics will be displayed here.</p>
      </div>
    </div>
  );
}

