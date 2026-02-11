'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DeleteProjectModal } from './DeleteProjectModal';
import { BsChevronDoubleRight, BsFillTrash3Fill } from "react-icons/bs";

interface Project {
  id: string;
  name: string;
  description?: string;
  repo_url?: string;
  manager_user_id: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
  created_at: string;
}

interface ProjectListProps {
  projects: Project[];
  onProjectDeleted?: () => void;
  showDeleteButton?: boolean;
}

export function ProjectList({ projects, onProjectDeleted, showDeleteButton = true }: ProjectListProps) {
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-600">No projects found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Manager
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{project.name}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500">
                  {project.description || 'No description'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {project.user?.full_name || project.user?.email || 'Unknown'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(project.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-3">
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="p-1 rounded text-indigo-600 hover:bg-indigo-900 hover:text-white hover:drop-shadow-[0_0_2px_rgba(255,255,255,1)] transition-all duration-200"
                  >
                    <BsChevronDoubleRight />
                  </Link>
                  {showDeleteButton && (
                    <button
                      onClick={() => setProjectToDelete(project)}
                      className="p-1 rounded text-red-600 hover:bg-red-900 hover:text-white hover:drop-shadow-[0_0_2px_rgba(255,255,255,1)] transition-all duration-200"
                    >
                      <BsFillTrash3Fill />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {projectToDelete && (
        <DeleteProjectModal
          project={projectToDelete}
          onClose={() => setProjectToDelete(null)}
          onSuccess={() => {
            setProjectToDelete(null);
            onProjectDeleted?.();
          }}
        />
      )}
    </div>
  );
}

