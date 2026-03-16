import React from 'react';

export function InventoryTab({ inventory, updateStock, updateReorderPoint, fetchData }: any) {
  return (
    <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <h3 className="font-semibold text-white">Full Inventory List</h3>
        <button onClick={fetchData} className="bg-emerald-500 text-black px-4 py-2 rounded-lg text-xs font-bold">Refresh Data</button>
      </div>
      <div className="overflow-x-auto">
        {inventory.length === 0 ? (
          <div className="py-20 text-center text-gray-500">No inventory data found.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-white/5">
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Current Stock</th>
                <th className="px-6 py-4 font-medium">Reorder Point</th>
                <th className="px-6 py-4 font-medium">Avg Sales</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inventory.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{item.name}</td>
                  <td className="px-6 py-4 font-mono">
                    <input 
                      type="number" 
                      defaultValue={item.stock_level}
                      onBlur={(e) => updateStock(item.product_id || item.id, parseInt(e.target.value))}
                      className="w-16 bg-black border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </td>
                  <td className="px-6 py-4 font-mono">
                    <input 
                      type="number" 
                      defaultValue={item.reorder_point}
                      onBlur={(e) => updateReorderPoint(item.product_id || item.id, parseInt(e.target.value))}
                      className="w-16 bg-black border border-white/10 rounded px-2 py-1 text-gray-400 focus:outline-none focus:border-emerald-500/50"
                    />
                  </td>
                  <td className="px-6 py-4 font-mono">{item.avg_weekly_sales || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md border ${
                      item.stock_level < item.reorder_point 
                      ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {item.stock_level < item.reorder_point ? 'Low' : 'OK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
