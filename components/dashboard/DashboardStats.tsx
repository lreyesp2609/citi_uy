// components/dashboard/DashboardStats.tsx
'use client';

interface Stat {
  title: string;
  value: number;
  subtitle: string;
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'indigo';
}

interface DashboardStatsProps {
  stats: Stat[];
}

const colorClasses = {
  blue: 'border-blue-500 text-blue-600',
  green: 'border-green-500 text-green-600',
  purple: 'border-purple-500 text-purple-600',
  red: 'border-red-500 text-red-600',
  yellow: 'border-yellow-500 text-yellow-600',
  indigo: 'border-indigo-500 text-indigo-600',
};

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className={`bg-white rounded-lg shadow p-6 border-l-4 ${colorClasses[stat.color].split(' ')[0]}`}
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{stat.title}</h3>
          <p className={`text-3xl font-bold ${colorClasses[stat.color].split(' ')[1]}`}>
            {stat.value}
          </p>
          <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
        </div>
      ))}
    </div>
  );
}