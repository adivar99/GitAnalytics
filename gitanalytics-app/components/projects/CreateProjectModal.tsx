'use client';

import { useState } from 'react';
import { useMutation, useLazyQuery } from '@apollo/client';
import { CREATE_PROJECT, GET_USER_BY_EMAIL, ASSIGN_MEMBER } from '@/lib/graphql/queries';
import { useAuth } from '@/app/hooks/useAuth';

interface CreateProjectModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProjectModal({ onClose, onSuccess }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [validatingEmail, setValidatingEmail] = useState(false);
  const { user } = useAuth();

  const [getUserByEmail] = useLazyQuery(GET_USER_BY_EMAIL);

  const [createProject, { loading: creatingProject }] = useMutation(CREATE_PROJECT, {
    onError: (err) => {
      setError(err.message);
    },
  });

  const [assignMember, { loading: assigningMember }] = useMutation(ASSIGN_MEMBER, {
    onCompleted: () => {
      onSuccess();
    },
    onError: (err) => {
      setError(`Project created but failed to assign manager: ${err.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !managerEmail) {
      setError('Name and manager email are required');
      return;
    }

    if (!user?.company_id) {
      setError('User company information not found');
      return;
    }

    try {
      // Validate email and get user ID
      setValidatingEmail(true);
      const { data, error: queryError } = await getUserByEmail({
        variables: {
          email: managerEmail.trim(),
          companyId: user.company_id,
        },
      });

      setValidatingEmail(false);

      if (queryError) {
        setError('Failed to validate manager email');
        return;
      }

      if (!data?.users || data.users.length === 0) {
        setError('No user found with this email in your company');
        return;
      }

      const managerUser = data.users[0];

      // Create project with the manager's UUID
      const projectResult = await createProject({
        variables: {
          name,
          managerUserId: managerUser.id as string,
          description: description || undefined,
        },
      });

      if (!projectResult.data?.createProject?.id) {
        setError('Failed to create project');
        return;
      }

      const projectId = projectResult.data.createProject.id;

      // Assign the manager as a project member with DEVELOPER role
      await assignMember({
        variables: {
          projectId: projectId,
          userId: managerUser.id as string,
          role: 'DEVELOPER',
        },
      });
    } catch (err) {
      setValidatingEmail(false);
      // Error handled in onError
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Create Project</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-800 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manager Email
            </label>
            <input
              type="email"
              value={managerEmail}
              onChange={(e) => setManagerEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="manager@example.com"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the email of a user in your company
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingProject || assigningMember || validatingEmail}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {validatingEmail
                ? 'Validating...'
                : creatingProject
                ? 'Creating Project...'
                : assigningMember
                ? 'Assigning Manager...'
                : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

