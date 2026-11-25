import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

export default function ProductivityChart({ data = [] }) {
  const hasAny = data.some((d) => d.count > 0);

  return (
    <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-5 flex flex-col">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white">Productivity Overview</h2>
        <p className="text-xs text-slate-400 mt-0.5">Task distribution across workflow stages</p>
      </div>

      {!hasAny ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
          <BarChart3 className="h-8 w-8 text-slate-600 mb-2" />
          <p className="text-sm text-slate-400">Create tasks to visualize workflow productivity.</p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243047" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                contentStyle={{
                  backgroundColor: '#0F1524',
                  borderColor: '#263147',
                  borderRadius: '0.5rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={56}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill || '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
