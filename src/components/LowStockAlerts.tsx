import { AlertTriangle, ChevronRight } from 'lucide-react';

interface LowStockAlertsProps {
  inventory: any[];
  onDrillDown: (product: any) => void;
}

export function LowStockAlerts({ inventory, onDrillDown }: LowStockAlertsProps) {
  const alerts = inventory.filter(item => item.stock_level < item.reorder_point);

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-5 h-5 text-rose-400" />
        <h3 className="text-white font-semibold">Action Required: Low Stock</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {alerts.length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-8">No low stock alerts.</div>
        ) : (
          alerts.map(item => (
            <div 
              key={item.id}
              onClick={() => onDrillDown(item)}
              className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              <div>
                <h4 className="text-white font-medium text-sm">{item.name}</h4>
                <div className="flex gap-3 mt-1 text-xs">
                  <span className="text-rose-400 font-medium">Stock: {item.stock_level}</span>
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-400">Reorder: {item.reorder_point}</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-400" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
