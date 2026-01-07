'use client';

interface Contributor {
  author_email?: string;
  author_name?: string;
  commit_count?: number;
}

interface TopContributorsProps {
  data: Contributor[];
}

export function TopContributors({ data }: TopContributorsProps) {
  // Group by author_email and count commits
  const contributorMap = new Map<string, { name?: string; count: number }>();
  
  data.forEach((item) => {
    if (item.author_email) {
      const existing = contributorMap.get(item.author_email) || { count: 0 };
      contributorMap.set(item.author_email, {
        name: item.author_name || existing.name,
        count: existing.count + (item.commit_count || 1),
      });
    }
  });

  const contributors = Array.from(contributorMap.entries())
    .map(([email, info]) => ({
      email,
      name: info.name || email,
      count: info.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Top Contributors</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Commits
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contributors.map((contributor, index) => (
              <tr key={contributor.email} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {contributor.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {contributor.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {contributor.count}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {contributors.length === 0 && (
        <div className="text-center py-8 text-gray-500">No contributor data available</div>
      )}
    </div>
  );
}

