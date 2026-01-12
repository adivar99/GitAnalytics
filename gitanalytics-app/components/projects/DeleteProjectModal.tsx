'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { DELETE_PROJECT } from '@/lib/graphql/queries';

interface DeleteProjectModalProps {
  project: {
    id: string;
    name: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteProjectModal({ project, onClose, onSuccess }: DeleteProjectModalProps) {
  const [confirmName, setConfirmName] = useState('');
  const [error, setError] = useState('');

  const [deleteProject, { loading }] = useMutation(DELETE_PROJECT, {
    onCompleted: (data) => {
      if (data?.deleteProject?.success) {
        onSuccess();
      } else {
        setError(data?.deleteProject?.message || 'Failed to delete project');
      }
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (confirmName !== project.name) {
      setError('Project name does not match');
      return;
    }

    try {
      await deleteProject({
        variables: {
          projectId: project.id,
        },
      });
    } catch (err) {
      // Error handled in onError
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Delete Project</h2>

        <div className="mb-4">
          <p className="text-gray-700 mb-2">
            Are you sure you want to delete the project <strong>{project.name}</strong>?
          </p>
          <p className="text-sm text-gray-600">
            This action cannot be undone. All project data, including members, commits, and analytics will be permanently deleted.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-800 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type the project name to confirm: <strong>{project.name}</strong>
            </label>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || confirmName !== project.name}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Deleting...' : 'Delete Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

