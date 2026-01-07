'use client';

interface ChurnData {
  id: string;
  perpetrator_email?: string;
  victim_email?: string;
  lines_overwritten: number;
  commit_hash: string;
}

interface ChurnHeatmapProps {
  data: ChurnData[];
}

export function ChurnHeatmap({ data }: ChurnHeatmapProps) {
  const topChurn = data.slice(0, 20); // Top 20 churn metrics

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Top Overwritten Code</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Perpetrator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Victim
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lines Overwritten
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {topChurn.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.perpetrator_email || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.victim_email || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    {item.lines_overwritten}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {topChurn.length === 0 && (
        <div className="text-center py-8 text-gray-500">No churn data available</div>
      )}
    </div>
  );
}

