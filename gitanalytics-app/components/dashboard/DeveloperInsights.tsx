'use client';

import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

interface Project {
  id: string;
  name: string;
}

interface DeveloperInsightsProps {
  userId: string;
  projects: Project[];
}

// GraphQL query to get developer analytics
const GET_DEVELOPER_ANALYTICS = gql`
  query GetDeveloperAnalytics($userId: uuid!, $projectIds: [uuid!]!) {
    # Get commits by the user across all projects
    git_commits(
      where: {
        author_email: { _in: [] }
        project_id: { _in: $projectIds }
      }
      order_by: { committed_at: desc }
    ) {
      hash
      author_name
      author_email
      message
      project_id
      committed_at
    }
    
    # Get commit count per project
    commits_by_project: git_commits_aggregate(
      where: { project_id: { _in: $projectIds } }
    ) {
      aggregate {
        count
      }
      nodes {
        project_id
      }
    }
  }
`;

export function DeveloperInsights({ userId, projects }: DeveloperInsightsProps) {
  const projectIds = projects.map(p => p.id);
  
  const { data, loading } = useQuery(GET_DEVELOPER_ANALYTICS, {
    variables: { 
      userId,
      projectIds 
    },
    skip: projectIds.length === 0,
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Developer Insights</h2>
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  // Calculate metrics
  const totalCommits = data?.git_commits?.length || 0;
  
  // Calculate commit streak (simplified - consecutive days with commits)
  const commitDates = data?.git_commits?.map((c: any) => 
    new Date(c.committed_at).toDateString()
  ) || [];
  const uniqueDates = [...new Set(commitDates)];
  const commitStreak = uniqueDates.length;

  // Calculate commits per project for pie chart
  const commitsPerProject = new Map<string, number>();
  projects.forEach(p => commitsPerProject.set(p.id, 0));
  
  data?.git_commits?.forEach((commit: any) => {
    const count = commitsPerProject.get(commit.project_id) || 0;
    commitsPerProject.set(commit.project_id, count + 1);
  });

  // Calculate integrity score (placeholder - can be enhanced)
  // For now: based on commit frequency and consistency
  const integrityScore = Math.min(100, Math.round((commitStreak / 30) * 100));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-6">Developer Insights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Integrity Score */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium mb-1">Integrity Score</div>
          <div className="text-3xl font-bold text-blue-900">{integrityScore}%</div>
          <div className="text-xs text-blue-600 mt-1">Based on consistency</div>
        </div>

        {/* Total Commits */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium mb-1">Total Commits</div>
          <div className="text-3xl font-bold text-green-900">{totalCommits}</div>
          <div className="text-xs text-green-600 mt-1">Across all projects</div>
        </div>

        {/* Commit Streak */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium mb-1">Active Days</div>
          <div className="text-3xl font-bold text-purple-900">{commitStreak}</div>
          <div className="text-xs text-purple-600 mt-1">Days with commits</div>
        </div>

        {/* Projects Contributed */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="text-sm text-orange-600 font-medium mb-1">Projects</div>
          <div className="text-3xl font-bold text-orange-900">{projects.length}</div>
          <div className="text-xs text-orange-600 mt-1">Active projects</div>
        </div>
      </div>

      {/* Commits Breakdown by Project */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Commits by Project</h3>
        <div className="space-y-3">
          {projects.map(project => {
            const commits = commitsPerProject.get(project.id) || 0;
            const percentage = totalCommits > 0 ? (commits / totalCommits) * 100 : 0;
            
            return (
              <div key={project.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{project.name}</span>
                  <span className="text-gray-600">{commits} commits ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

