import { ReactNode } from 'react';
import { cn } from '../utils/cn';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function KPICard({ title, value, icon, trend, trendUp, className }: KPICardProps) {
  return (
    <div className={cn("bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 font-medium text-sm">{title}</h3>
        <div className="p-2 bg-white/5 rounded-lg text-indigo-400">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        {trend && (
          <span className={cn("text-sm font-medium", trendUp ? "text-emerald-400" : "text-rose-400")}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
