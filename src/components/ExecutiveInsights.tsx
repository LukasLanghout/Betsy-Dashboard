import React from 'react';
import { AlertCircle, TrendingUp, Zap, ShieldCheck } from 'lucide-react';

interface Insight {
  type: 'warning' | 'success' | 'info';
  message: string;
  subtext: string;
  icon: React.ReactNode;
}

export function ExecutiveInsights({ insights }: { insights: Insight[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {insights.map((insight, idx) => (
        <div 
          key={idx} 
          className={`p-4 rounded-xl border flex items-start gap-4 transition-all hover:scale-[1.02] cursor-default ${
            insight.type === 'warning' 
              ? 'bg-rose-500/5 border-rose-500/20 text-rose-500' 
              : insight.type === 'success'
              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'
              : 'bg-blue-500/5 border-blue-500/20 text-blue-500'
          }`}
        >
          <div className="p-2 bg-white/5 rounded-lg">
            {insight.icon}
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">{insight.message}</p>
            <p className="text-[10px] opacity-70 mt-1 uppercase tracking-wider font-medium">{insight.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
