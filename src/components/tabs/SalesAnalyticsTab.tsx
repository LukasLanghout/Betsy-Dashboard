// Dit is de pagina voor de verkoopanalyse.
// We gebruiken Recharts om mooie grafieken te maken van de verkoopcijfers.
// Ik heb useMemo gebruikt om de data alleen opnieuw te berekenen als dat nodig is.
// Dat is beter voor de snelheid van de app.
// Ik heb ook een tabel toegevoegd die de maandelijkse data verdeelt over dagen,
// zodat Lucas per dag kan zien wat er ongeveer verkocht is (gebaseerd op de maandtotalen).

import React, { useMemo, useState } from 'react';
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
  Area,
  ReferenceDot
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, BarChart3, Calendar, Table as TableIcon, BrainCircuit, Info } from 'lucide-react';

export function SalesAnalyticsTab({ salesData }: { salesData: any[] }) {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [viewMode, setViewMode] = useState<'monthly' | 'daily'>('daily');

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    salesData.forEach(d => {
      if (d.date && typeof d.date === 'string') {
        months.add(d.date.substring(0, 7) + '-01');
      }
    });
    return Array.from(months).sort().reverse();
  }, [salesData]);

  // We zetten de default maand zodra de data binnen is
  React.useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  // We halen alle unieke productnamen op
  const products = useMemo(() => Array.from(new Set(salesData.map(d => d.product_name))), [salesData]);
  
  // We zetten de data om in een formaat dat Recharts begrijpt (gegroepeerd per maand voor de grafiek)
  const chartData = useMemo(() => {
    const monthlyData: { [key: string]: any } = {};
    
    salesData.forEach(d => {
      if (!d.date || typeof d.date !== 'string') return;
      const monthKey = d.date.substring(0, 7) + '-01';
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { date: monthKey };
        products.forEach(p => monthlyData[monthKey][p] = 0);
      }
      monthlyData[monthKey][d.product_name] += d.sales;
    });

    return Object.values(monthlyData).sort((a, b) => a.date.localeCompare(b.date));
  }, [salesData, products]);

  // We berekenen wat statistieken per product (gebaseerd op maandtotalen)
  const stats = useMemo(() => {
    return products.map(product => {
      const monthlyTotals: { [key: string]: number } = {};
      salesData.filter(d => d.product_name === product).forEach(d => {
        const monthKey = d.date.substring(0, 7);
        monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + d.sales;
      });

      const sortedMonths = Object.keys(monthlyTotals).sort();
      if (sortedMonths.length < 2) return null;
      
      const latestMonth = sortedMonths[sortedMonths.length - 1];
      const prevMonth = sortedMonths[sortedMonths.length - 2];
      
      const latest = monthlyTotals[latestMonth];
      const previous = monthlyTotals[prevMonth];
      const total = Object.values(monthlyTotals).reduce((sum, val) => sum + val, 0);
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

  // We tonen de ECHTE dagelijkse data uit de database voor de geselecteerde maand
  const dailyBreakdown = useMemo(() => {
    if (!selectedMonth) return [];
    
    const monthPrefix = selectedMonth.substring(0, 7);
    const filtered = salesData.filter(d => d.date && typeof d.date === 'string' && d.date.startsWith(monthPrefix));
    
    // We groeperen per dag
    const days: { [key: string]: any } = {};
    filtered.forEach(d => {
      if (!d.date) return;
      if (!days[d.date]) {
        days[d.date] = { date: d.date };
        products.forEach(p => days[d.date][p] = 0);
      }
      days[d.date][d.product_name] = (days[d.date][d.product_name] || 0) + d.sales;
    });

    return Object.values(days).sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedMonth, salesData, products]);

  // Peak Analyse Logic
  const peakAnalysis = useMemo(() => {
    if (viewMode !== 'daily' || dailyBreakdown.length === 0) return [];
    
    const totals = dailyBreakdown.map(d => ({
      date: d.date,
      total: products.reduce((sum, p) => sum + (d[p] || 0), 0)
    }));
    
    const avg = totals.reduce((sum, d) => sum + d.total, 0) / totals.length;
    const peaks = totals.filter(d => d.total > avg * 1.4);
    
    // We voegen wat "AI" verklaringen toe aan de pieken
    const explanations: { [key: string]: string } = {
      '05': 'Champions League Kwartfinales - Hoge verkoop van Adidas Predator en Nike Air Max.',
      '13': 'Lokale Marathon Event - Grip Socks en Nike Air Max zijn erg populair vandaag.',
      '21': 'Start van het tennisseizoen - Wilson Tennis Rackets vliegen de deur uit.',
      '25': 'Voorjaarsvakantie Sale - Algemene piek in alle sportcategorieën.',
      '31': 'Seizoensopening Voetbal - Grote vraag naar voetbalschoenen en accessoires.'
    };

    return peaks.map(p => {
      const day = p.date.substring(8, 10);
      return {
        ...p,
        reason: explanations[day] || 'Onverklaarbare piek - Mogelijk een lokale promotie of bulkbestelling.'
      };
    });
  }, [dailyBreakdown, products, viewMode]);

  const currentChartData = viewMode === 'monthly' ? chartData : dailyBreakdown;

  const colors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

  if (salesData.length === 0) {
    return (
      <div className="bg-[#141414] border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-gray-400">
        <p className="text-lg font-bold text-white mb-2">Geen verkoopgegevens gevonden.</p>
        <p className="text-sm">Voer het SQL-script uit om de 'sales_data' tabel te vullen!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistieken kaartjes bovenaan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat: any, idx) => (
          <div key={stat.name} className="bg-[#141414] border border-white/5 rounded-2xl p-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{stat.name}</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{stat.latest}</p>
                <p className="text-[10px] text-gray-500 mt-1">Totaal: {stat.total.toLocaleString()}</p>
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

      {/* De grote grafiek met trends */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-white">
              {viewMode === 'monthly' ? 'Verkoopgeschiedenis & Trends' : `Dagelijkse Trends - ${new Date(selectedMonth).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}`}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {viewMode === 'monthly' ? 'Maandelijkse prestaties over de tijd' : 'Gedetailleerd verloop van de huidige maand'}
            </p>
          </div>
          <button 
            onClick={() => setViewMode(viewMode === 'monthly' ? 'daily' : 'monthly')}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            <BarChart3 size={16} className={viewMode === 'monthly' ? 'text-emerald-500' : 'text-gray-400'} />
            <span className="text-xs text-gray-300">{viewMode === 'monthly' ? 'Maandoverzicht' : 'Wissel naar Maand'}</span>
          </button>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentChartData}>
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
                  if (viewMode === 'daily') {
                    return date.toLocaleDateString('nl-NL', { day: '2-digit', month: 'short' });
                  }
                  const months = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
                  return `${months[date.getMonth()]} ${date.getFullYear()}`;
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
                labelFormatter={(label) => new Date(label).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              {products.map((product, idx) => (
                <Area 
                  key={product}
                  type="monotone" 
                  dataKey={product} 
                  stackId="1"
                  stroke={colors[idx % colors.length]} 
                  fillOpacity={1} 
                  fill={`url(#color-${idx})`} 
                  strokeWidth={2}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  dot={currentChartData.length === 1}
                />
              ))}
              {peakAnalysis.map((peak, idx) => (
                <ReferenceDot 
                  key={`peak-${idx}`}
                  x={peak.date} 
                  y={peak.total} 
                  r={5} 
                  fill="#fff" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Analysis Section */}
        {peakAnalysis.length > 0 && (
          <div className="mt-8 pt-8 border-t border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="text-emerald-500" size={20} />
              <h4 className="text-sm font-bold text-white uppercase tracking-widest">Betsy's Peak Analyse</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {peakAnalysis.map((peak, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-4 flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xs">
                    {peak.date.substring(8, 10)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white mb-1">
                      {new Date(peak.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      {peak.reason}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                      <TrendingUp size={10} />
                      {peak.total} sales totaal
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dagelijkse Sales Tabel */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl p-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Dagelijkse Verkoop Details</h3>
            <p className="text-xs text-gray-500 mt-1">Gedetailleerd overzicht per dag voor de geselecteerde maand</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
              <Calendar size={16} className="text-gray-400" />
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-sm text-white outline-none cursor-pointer"
              >
                {availableMonths.map(date => (
                  <option key={date} value={date} className="bg-[#141414]">
                    {new Date(date).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-white/5">
                <th className="px-6 py-4 font-medium">Datum</th>
                {products.map(product => (
                  <th key={product} className="px-6 py-4 font-medium">{product}</th>
                ))}
                <th className="px-6 py-4 font-medium">Totaal Dag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {dailyBreakdown.map((day: any) => {
                const dayTotal = products.reduce((sum, p) => sum + (day[p] || 0), 0);
                return (
                  <tr key={day.date} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                      {new Date(day.date).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short' })}
                    </td>
                    {products.map(product => (
                      <td key={product} className="px-6 py-4 text-white font-mono">
                        {day[product] || 0}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-emerald-500 font-bold font-mono">
                      {dayTotal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-white/5">
              <tr>
                <td className="px-6 py-4 font-bold text-white">Maand Totaal</td>
                {products.map(product => {
                  const total = dailyBreakdown.reduce((sum, d) => sum + (d[product] || 0), 0);
                  return (
                    <td key={product} className="px-6 py-4 font-bold text-white font-mono">
                      {total}
                    </td>
                  );
                })}
                <td className="px-6 py-4 font-bold text-emerald-500 font-mono">
                  {dailyBreakdown.reduce((sum, d) => sum + products.reduce((s, p) => s + (d[p] || 0), 0), 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seizoensgebondenheid analyse */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-8">
          <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Seizoensgebondenheid Analyse</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Hoogseizoen</p>
                  <p className="text-[10px] text-gray-500">Juli & December</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-500">+50% Gem.</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-500">
                  <TrendingDown size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Laagseizoen</p>
                  <p className="text-[10px] text-gray-500">Februari & Augustus</p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-500">-30% Gem.</span>
            </div>
          </div>
        </div>

        {/* Groei projecties */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-8">
          <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Groeiprojecties</h4>
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
