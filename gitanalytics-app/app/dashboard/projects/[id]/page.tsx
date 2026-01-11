'use client';

import { useQuery } from '@apollo/client';
import { useParams } from 'next/navigation';
import {
  GET_BRANCH_HEALTH,
  GET_CHURN_METRICS,
  GET_FILE_EXTENSION_STATS,
  GET_TOP_CONTRIBUTORS,
  GET_PROJECT_MEMBERS,
  GET_PROJECT,
} from '@/lib/graphql/queries';
import { BranchHealthChart } from '@/components/charts/BranchHealthChart';
import { FileDistributionChart } from '@/components/charts/FileDistributionChart';
import { ChurnHeatmap } from '@/components/charts/ChurnHeatmap';
import { TopContributors } from '@/components/charts/TopContributors';
import { AddMemberModal } from '@/components/projects/AddMemberModal';
import { RemoveMemberModal } from '@/components/projects/RemoveMemberModal';
import { useState } from 'react';
import { BsFillTrash3Fill } from 'react-icons/bs';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);

  const { data: branchData, loading: branchLoading } = useQuery(GET_BRANCH_HEALTH, {
    variables: { projectId },
    skip: !projectId,
  });

  const { data: churnData, loading: churnLoading } = useQuery(GET_CHURN_METRICS, {
    variables: { projectId },
    skip: !projectId,
  });

  const { data: fileData, loading: fileLoading } = useQuery(GET_FILE_EXTENSION_STATS, {
    variables: { projectId },
    skip: !projectId,
  });

  const { data: contributorsData, loading: contributorsLoading } = useQuery(GET_TOP_CONTRIBUTORS, {
    variables: { projectId },
    skip: !projectId,
  });

  const { data: membersData, loading: membersLoading, refetch: refetchMembers } = useQuery(GET_PROJECT_MEMBERS, {
    variables: { projectId },
    skip: !projectId,
  });

  const { data: projectData, loading: projectLoading } = useQuery(GET_PROJECT, {
    variables: { projectId },
    skip: !projectId,
  });

  // Process branch health data
  const branchHealth = {
    HOT: branchData?.git_branches?.filter((b: any) => b.health_status === 'HOT').length || 0,
    STABLE: branchData?.git_branches?.filter((b: any) => b.health_status === 'STABLE').length || 0,
    STALE: branchData?.git_branches?.filter((b: any) => b.health_status === 'STALE').length || 0,
  };

  if (branchLoading || churnLoading || fileLoading || contributorsLoading || membersLoading || projectLoading) {
    return <div>Loading project details...</div>;
  }

  const projectName = projectData?.projects_by_pk?.name || 'Project';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Project Details</h1>
        <button
          onClick={() => setShowAddMemberModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add Member
        </button>
      </div>

      {showAddMemberModal && (
        <AddMemberModal
          projectId={projectId}
          onClose={() => setShowAddMemberModal(false)}
          onSuccess={() => {
            setShowAddMemberModal(false);
            refetchMembers();
          }}
        />
      )}

      {memberToRemove && (
        <RemoveMemberModal
          member={memberToRemove}
          projectName={projectName}
          onClose={() => setMemberToRemove(null)}
          onSuccess={() => {
            setMemberToRemove(null);
            refetchMembers();
          }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BranchHealthChart data={branchHealth} />
        <FileDistributionChart 
          data={
            fileData?.git_commits?.flatMap((commit: any) => 
              commit.file_extension_stats || []
            ) || []
          } 
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ChurnHeatmap data={churnData?.churn_metrics || []} />
        <TopContributors data={contributorsData?.git_commits || []} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Project Members</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {membersData?.project_members?.map((member: any) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.user?.full_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.user?.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.joined_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setMemberToRemove(member)}
                      className="p-1 rounded text-red-600 hover:bg-red-900 hover:text-white hover:drop-shadow-[0_0_2px_rgba(255,255,255,1)] transition-all duration-200"
                    >
                      <BsFillTrash3Fill />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

