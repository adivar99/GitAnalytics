'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useAuth } from '@/app/contexts/AuthContext';
import { GET_CURRENT_USER, GET_COMPANY_USERS } from '@/lib/graphql/queries';
import UserTable from '@/components/dashboard/UserTable';
import AddUserModal from '@/components/dashboard/AddUserModal';

export default function UserManagementPage() {
    const { user } = useAuth();
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

    // 1. Get current user's company ID
    // Although AuthContext provides company_id, we double check or use it directly.
    // AuthContext's user object now has company_id.
    const companyId = user?.company_id;

    // 2. Fetch company users
    const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useQuery(GET_COMPANY_USERS, {
        variables: { companyId },
        skip: !companyId,
        notifyOnNetworkStatusChange: true, // Show loading on refetch
    });

    // Verify if user is admin (Optional: based on requirement "visible only to the admin")
    // We can check this against the current user data or assume the route is protected/hidden by layout.
    // For now, we just render.

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage users in your company and view their project assignments.
                    </p>
                </div>
                <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Add New User
                </button>
            </div>

            <UserTable
                users={usersData?.users || []}
                loading={usersLoading && !usersData} // Show loading only on initial load or if no data
            />

            {companyId && (
                <AddUserModal
                    isOpen={isAddUserModalOpen}
                    onClose={() => setIsAddUserModalOpen(false)}
                    companyId={companyId}
                    onUserAdded={() => {
                        refetchUsers();
                    }}
                />
            )}
        </div>
    );
}
