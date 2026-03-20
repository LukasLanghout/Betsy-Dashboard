import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface OrderPipelineProps {
  data: any[];
}

export function OrderPipeline({ data }: OrderPipelineProps) {
  // Ensure we have the right stages even if count is 0
  const stages = ['Pending', 'Delivered'];
  const chartData = stages.map(stage => {
    const found = data.find(d => d.stage.toLowerCase() === stage.toLowerCase());
    return {
      stage,
      count: found ? found.count : 0
    };
  });

  const colors = ['#6366f1', '#10b981'];
  
  return (
    <div className="bg-[#141414] border border-white/5 rounded-2xl p-8 h-[450px] flex flex-col group transition-all hover:border-white/10">
      <div className="mb-8">
        <h3 className="text-white font-bold text-lg tracking-tight">Fulfillment Pipeline</h3>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Operational Throughput & Bottlenecks</p>
      </div>
      
      <div className="flex-1 w-full min-h-0 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={true} vertical={false} />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="stage" 
              type="category" 
              stroke="#4b5563" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              cursor={{fill: '#ffffff05'}}
              contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#ffffff10', color: '#fff', borderRadius: '8px', fontSize: '10px' }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
        {chartData.map((d, i) => (
          <div key={i} className="text-center">
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter mb-1">{d.stage}</p>
            <p className="text-xl font-bold text-white">{d.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
