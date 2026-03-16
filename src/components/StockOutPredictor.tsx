import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StockOutPredictorProps {
  data: any[];
}

export function StockOutPredictor({ data }: StockOutPredictorProps) {
  // Calculate weeks until stock out
  const chartData = data.map(item => ({
    name: item.name,
    currentStock: item.stock_level,
    weeksUntilStockOut: item.avg_weekly_sales > 0 ? Number((item.stock_level / item.avg_weekly_sales).toFixed(1)) : 99,
    isLow: item.stock_level < item.reorder_point
  })).sort((a, b) => a.weeksUntilStockOut - b.weeksUntilStockOut);

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-[400px] flex flex-col">
      <h3 className="text-white font-semibold mb-6">Stock-out Predictor (Weeks)</h3>
      <div className="flex-1 w-full min-h-0 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" horizontal={false} />
            <XAxis type="number" stroke="#9ca3af" />
            <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} tick={{fill: '#9ca3af', fontSize: 12}} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
              cursor={{fill: '#ffffff10'}}
            />
            <Bar dataKey="weeksUntilStockOut" name="Weeks to Stock-out" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isLow ? '#f43f5e' : '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
