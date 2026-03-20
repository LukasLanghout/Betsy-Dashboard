import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

export function SalesAnalyticsTab({ salesData }: { salesData: any[] }) {
  const products = useMemo(() => Array.from(new Set(salesData.map(d => d.product_name))), [salesData]);
  
  const chartData = useMemo(() => {
    const dates = Array.from(new Set(salesData.map(d => d.date))).sort();
    return dates.map(date => {
      const entry: any = { date };
      products.forEach(product => {
        const sale = salesData.find(d => d.date === date && d.product_name === product);
        entry[product] = sale ? sale.sales : 0;
      });
      return entry;
    });
  }, [salesData, products]);

  const stats = useMemo(() => {
    return products.map(product => {
      const productSales = salesData.filter(d => d.product_name === product).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      if (productSales.length < 2) return null;
      
      const latest = productSales[productSales.length - 1].sales;
      const previous = productSales[productSales.length - 2].sales;
      const total = productSales.reduce((sum, d) => sum + d.sales, 0);
      const growth = ((latest - previous) / previous) * 100;
      
      return {
        name: product,
        latest,
        total,
        growth,
        trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable'
      };
    }).filter(Boolean);
  }, [salesData, products]);

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat: any, idx) => (
          <div key={stat.name} className="bg-[#141414] border border-white/5 rounded-2xl p-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{stat.name}</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{stat.latest}</p>
                <p className="text-[10px] text-gray-500 mt-1">Total: {stat.total.toLocaleString()}</p>
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${
                stat.trend === 'up' ? 'text-emerald-500' : stat.trend === 'down' ? 'text-rose-500' : 'text-gray-500'
              }`}>
                {stat.trend === 'up' ? <TrendingUp size={14} /> : stat.trend === 'down' ? <TrendingDown size={14} /> : <Minus size={14} />}
                {Math.abs(stat.growth).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#141414] border border-white/5 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-white">Sales History & Trends</h3>
            <p className="text-xs text-gray-500 mt-1">5-year monthly performance tracking</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
            <BarChart3 size={16} className="text-gray-400" />
            <span className="text-xs text-gray-300">Monthly View</span>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                {products.map((product, idx) => (
                  <linearGradient key={`grad-${idx}`} id={`color-${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[idx % colors.length]} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={colors[idx % colors.length]} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#666" 
                fontSize={10} 
                tickFormatter={(str) => {
                  const date = new Date(str);
                  return date.getMonth() === 0 ? date.getFullYear().toString() : '';
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#666" 
                fontSize={10} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => val.toLocaleString()}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ padding: '2px 0' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              {products.map((product, idx) => (
                <Area 
                  key={product}
                  type="monotone" 
                  dataKey={product} 
                  stroke={colors[idx % colors.length]} 
                  fillOpacity={1} 
                  fill={`url(#color-${idx})`} 
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-8">
          <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Seasonality Analysis</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Peak Seasons</p>
                  <p className="text-[10px] text-gray-500">July & December</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-500">+50% Avg</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-500">
                  <TrendingDown size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Low Seasons</p>
                  <p className="text-[10px] text-gray-500">February & August</p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-500">-30% Avg</span>
            </div>
          </div>
        </div>

        <div className="bg-[#141414] border border-white/5 rounded-2xl p-8">
          <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Growth Projections</h4>
          <div className="space-y-4">
            {stats.sort((a, b) => b.growth - a.growth).map((stat: any) => (
              <div key={stat.name} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-400">{stat.name}</span>
                    <span className="text-xs text-white font-mono">{stat.growth > 0 ? '+' : ''}{stat.growth.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${Math.min(100, Math.max(0, stat.growth * 5))}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
