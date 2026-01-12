'use client';

import { useState } from 'react';
import { useMutation, useLazyQuery } from '@apollo/client';
import { ASSIGN_MEMBER, GET_USER_BY_EMAIL, GET_PROJECT } from '@/lib/graphql/queries';

interface AddMemberModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddMemberModal({ projectId, onClose, onSuccess }: AddMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'DEVELOPER' | 'GUEST'>('DEVELOPER');
  const [error, setError] = useState('');
  const [validatingEmail, setValidatingEmail] = useState(false);

  const [getProject] = useLazyQuery(GET_PROJECT);
  const [getUserByEmail] = useLazyQuery(GET_USER_BY_EMAIL);

  const [assignMember, { loading }] = useMutation(ASSIGN_MEMBER, {
    onCompleted: () => {
      onSuccess();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      // First, get the project to find its company_id
      setValidatingEmail(true);
      const { data: projectData, error: projectError } = await getProject({
        variables: { projectId },
      });

      if (projectError || !projectData?.projects_by_pk) {
        setValidatingEmail(false);
        setError('Failed to fetch project details');
        return;
      }

      const companyId = projectData.projects_by_pk.company_id;

      // Validate email and get user ID
      const { data: userData, error: userError } = await getUserByEmail({
        variables: {
          email: email.trim(),
          companyId: companyId,
        },
      });

      setValidatingEmail(false);

      if (userError) {
        setError('Failed to validate user email');
        return;
      }

      if (!userData?.users || userData.users.length === 0) {
        setError('No user found with this email in the project\'s company');
        return;
      }

      const user = userData.users[0];

      // Assign the member
      await assignMember({
        variables: {
          projectId,
          userId: user.id as string,
          role,
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
        <h2 className="text-2xl font-bold mb-4">Add Member</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-800 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="user@example.com"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the email of a user in the project's company
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'DEVELOPER' | 'GUEST')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="DEVELOPER">Developer</option>
              <option value="GUEST">Guest</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              disabled={loading || validatingEmail}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || validatingEmail}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {validatingEmail
                ? 'Validating...'
                : loading
                ? 'Adding...'
                : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

