'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER_PROJECTS_WITH_ROLES } from '@/lib/graphql/queries';
import { useAuth } from '@/app/hooks/useAuth';
import { ProjectList } from '@/components/projects/ProjectList';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { DeveloperInsights } from '@/components/dashboard/DeveloperInsights';

interface Project {
  id: string;
  name: string;
  description?: string;
  repo_url?: string;
  manager_user_id: string;
  company_id: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

interface ProjectWithRole extends Project {
  userRole: 'admin' | 'manager' | 'developer' | 'guest';
}

interface ProjectMember {
  id: string;
  role: string;
  project: Project;
}

export function UnifiedDashboard() {
  const { user, userRole } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, error, loading, refetch } = useQuery(GET_USER_PROJECTS_WITH_ROLES, {
    variables: {
      userId: user?.id
    },
    skip: !user?.id,
    fetchPolicy: 'cache-and-network'
  });

  console.log('Query State:', { loading, hasData: !!data });

  if (error) {
    console.error('GraphQL Error:', error);
    return <div className="text-red-600">Error loading projects: {error.message}</div>;
  }

  if (loading) {
    return <div>Loading projects...</div>;
  }

  // Determine if user is admin
  const isAdmin = userRole === 'admin';

  // Build a unified list of projects with roles
  const projectsWithRoles: ProjectWithRole[] = [];
  const projectMap = new Map<string, ProjectWithRole>();

  // Add managed projects (where user is the manager)
  data?.managed_projects?.forEach((project: Project) => {
    if (!projectMap.has(project.id)) {
      const projectWithRole: ProjectWithRole = {
        ...project,
        userRole: 'manager'
      };
      projectMap.set(project.id, projectWithRole);
    }
  });

  // Add member projects (where user is a developer or guest)
  data?.member_projects?.forEach((pm: ProjectMember) => {
    if (!projectMap.has(pm.project.id)) {
      const projectWithRole: ProjectWithRole = {
        ...pm.project,
        userRole: pm.role.toLowerCase() as 'developer' | 'guest'
      };
      projectMap.set(pm.project.id, projectWithRole);
    }
  });

  // Convert map to array
  projectMap.forEach((project) => {
    projectsWithRoles.push(project);
  });

  // Filter projects for developer insights (exclude guest projects)
  const projectsForInsights = projectsWithRoles.filter(
    p => p.userRole !== 'guest'
  );

  return (
    <div className="space-y-8">
      {/* Project List Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">
            {isAdmin ? 'Company Projects' : 'My Projects'}
          </h2>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add Project
            </button>
          )}
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
          projects={projectsWithRoles}
          onProjectDeleted={() => refetch()}
          showDeleteButton={isAdmin}
        />
      </div>

      {/* Developer Insights Section - Only for managers and developers */}
      {userRole !== 'guest' && projectsForInsights.length > 0 && (
        <DeveloperInsights 
          userId={user?.id || ''} 
          projects={projectsForInsights}
        />
      )}
    </div>
  );
}

