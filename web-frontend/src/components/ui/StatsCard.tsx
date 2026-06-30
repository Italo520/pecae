import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
}

export function StatsCard({ title, value, icon, trend, trendLabel }: StatsCardProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <div className="bg-black/20 border border-white/10 p-6 rounded-2xl flex flex-col justify-between hover:border-white/20 transition-colors h-full">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-white/60 font-medium text-sm">{title}</h4>
        <div className="p-2 bg-white/5 rounded-lg text-white/70">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl font-display font-bold text-white mb-2">{value}</div>
        {(trend !== undefined || trendLabel) && (
          <div className="flex items-center text-sm">
            {trend !== undefined && (
              <span className={`font-semibold mr-2 ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-white/50'}`}>
                {isPositive ? '+' : ''}{trend}%
              </span>
            )}
            <span className="text-white/40">{trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
