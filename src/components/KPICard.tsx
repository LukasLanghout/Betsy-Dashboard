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
    <div className={cn("bg-[#141414] border border-white/5 rounded-2xl p-8 flex flex-col group transition-all hover:border-white/10", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="p-2 bg-white/5 rounded-lg text-gray-400 group-hover:text-white transition-colors">
          {icon}
        </div>
        {trend && (
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest", 
            trendUp ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500")}>
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.15em]">{title}</p>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
}
