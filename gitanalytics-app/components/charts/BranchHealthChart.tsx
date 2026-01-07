'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface BranchHealthData {
  HOT: number;
  STABLE: number;
  STALE: number;
}

interface BranchHealthChartProps {
  data: BranchHealthData;
}

const COLORS = {
  HOT: '#ef4444', // red
  STABLE: '#3b82f6', // blue
  STALE: '#6b7280', // gray
};

export function BranchHealthChart({ data }: BranchHealthChartProps) {
  const chartData = [
    { name: 'HOT', value: data.HOT, color: COLORS.HOT },
    { name: 'STABLE', value: data.STABLE, color: COLORS.STABLE },
    { name: 'STALE', value: data.STALE, color: COLORS.STALE },
  ].filter((item) => item.value > 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Branch Health Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

