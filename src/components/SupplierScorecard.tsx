import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

interface SupplierScorecardProps {
  data: any[];
}

export function SupplierScorecard({ data }: SupplierScorecardProps) {
  // Normalize data for scatter plot
  // X = Price Index (Lower is better)
  // Y = Reliability Score (Higher is better)
  // Z = Delivery Days (Smaller bubble is faster, but we'll use it for size)
  const chartData = data.map(s => ({
    name: s.name,
    price: s.avg_price_index || 100,
    reliability: (s.reliability_score || 0.9) * 100,
    delivery: s.delivery_days || 5,
    z: 100 / (s.delivery_days || 1) // Inverse for size: faster = bigger bubble
  }));

  return (
    <div className="bg-[#141414] border border-white/5 rounded-2xl p-8 h-[450px] flex flex-col group transition-all hover:border-white/10">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-white font-bold text-lg tracking-tight">Supplier Strategic Matrix</h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Price vs Reliability vs Speed</p>
        </div>
        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-gray-400">Reliable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-gray-400">Fast</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={true} />
            <XAxis 
              type="number" 
              dataKey="price" 
              name="Price Index" 
              unit="" 
              stroke="#4b5563" 
              fontSize={10}
              label={{ value: 'Price Index (Lower is Better)', position: 'bottom', fill: '#4b5563', fontSize: 10, offset: 0 }}
            />
            <YAxis 
              type="number" 
              dataKey="reliability" 
              name="Reliability" 
              unit="%" 
              stroke="#4b5563" 
              fontSize={10}
              label={{ value: 'Reliability %', angle: -90, position: 'insideLeft', fill: '#4b5563', fontSize: 10 }}
            />
            <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Speed Score" />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#1a1a1a] border border-white/10 p-3 rounded-lg shadow-2xl">
                      <p className="text-white font-bold text-xs mb-2 uppercase tracking-wider">{data.name}</p>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400">Price Index: <span className="text-white font-mono">{data.price}</span></p>
                        <p className="text-[10px] text-gray-400">Reliability: <span className="text-emerald-400 font-mono">{data.reliability}%</span></p>
                        <p className="text-[10px] text-gray-400">Lead Time: <span className="text-indigo-400 font-mono">{data.delivery} days</span></p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Suppliers" data={chartData} fill="#6366f1">
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.reliability > 90 ? '#10b981' : '#6366f1'} 
                  fillOpacity={0.6}
                  stroke={entry.reliability > 90 ? '#10b981' : '#6366f1'}
                  strokeWidth={2}
                />
              ))}
              <LabelList dataKey="name" position="top" fill="#9ca3af" fontSize={9} offset={10} />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
        <p className="text-[9px] text-gray-500 font-medium italic">Top-right quadrant indicates high-value strategic partners.</p>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Target Zone</span>
        </div>
      </div>
    </div>
  );
}
