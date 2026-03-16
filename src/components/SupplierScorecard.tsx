import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SupplierScorecardProps {
  data: any[];
}

export function SupplierScorecard({ data }: SupplierScorecardProps) {
  // Normalize data for radar chart
  const chartData = data.map(s => ({
    subject: s.name,
    Reliability: s.reliability_score,
    Speed: 100 - (s.delivery_days * 10), // Inverse: fewer days = higher score
    Price: 200 - s.avg_price_index, // Inverse: lower price index = higher score
  }));

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-[400px] flex flex-col">
      <h3 className="text-white font-semibold mb-2">Supplier Scorecard</h3>
      <div className="flex-1 w-full min-h-0 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#ffffff20" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280' }} />
            <Radar name="Reliability" dataKey="Reliability" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
            <Radar name="Speed" dataKey="Speed" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            <Radar name="Price" dataKey="Price" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
