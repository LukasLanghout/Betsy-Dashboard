// Dit is de tabel met alle producten in de voorraad.
// We kunnen hier direct de voorraad en het bestelpunt aanpassen.
// Als je op een veld klikt en dan ergens anders klikt (onBlur), wordt het opgeslagen.

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function InventoryTab({ inventory, updateStock, updateReorderPoint, fetchData }: any) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    setToast('Gegevens bijgewerkt');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden relative">
      {toast && (
        <div className="absolute top-4 right-4 bg-emerald-500 text-black px-4 py-2 rounded-lg text-sm font-bold z-50 animate-in fade-in slide-in-from-top-4">
          {toast}
        </div>
      )}
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <h3 className="font-semibold text-white">Volledige Voorraadlijst</h3>
        <button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="bg-emerald-500 text-black px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-50"
        >
          {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {isRefreshing ? 'Laden...' : 'Gegevens Vernieuwen'}
        </button>
      </div>
      <div className="overflow-x-auto">
        {inventory.length === 0 ? (
          <div className="py-20 text-center text-gray-500">Geen voorraadgegevens gevonden.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-white/5">
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Huidige Voorraad</th>
                <th className="px-6 py-4 font-medium">Bestelpunt</th>
                <th className="px-6 py-4 font-medium">Gem. Verkoop</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inventory.map((item: any) => (
                <InventoryRow 
                  key={item.product_id || item.id} 
                  item={item} 
                  updateStock={updateStock} 
                  updateReorderPoint={updateReorderPoint} 
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function InventoryRow({ item, updateStock, updateReorderPoint }: any) {
  const [stock, setStock] = useState(item.stock_level);
  const [reorderPoint, setReorderPoint] = useState(item.reorder_point);

  useEffect(() => {
    setStock(item.stock_level);
    setReorderPoint(item.reorder_point);
  }, [item.stock_level, item.reorder_point]);

  const handleStockBlur = () => {
    if (stock !== item.stock_level) {
      updateStock(item.product_id || item.id, stock, () => {
        setStock(item.stock_level); // Revert on cancel
      });
    }
  };

  const handleReorderBlur = () => {
    if (reorderPoint !== item.reorder_point) {
      updateReorderPoint(item.product_id || item.id, reorderPoint, () => {
        setReorderPoint(item.reorder_point); // Revert on cancel
      });
    }
  };

  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-6 py-4 text-white font-medium">{item.name}</td>
      <td className="px-6 py-4 font-mono">
        <input 
          type="number" 
          value={stock}
          onChange={(e) => setStock(parseInt(e.target.value) || 0)}
          onBlur={handleStockBlur}
          className="w-16 bg-black border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:border-emerald-500/50"
        />
      </td>
      <td className="px-6 py-4 font-mono">
        <input 
          type="number" 
          value={reorderPoint}
          onChange={(e) => setReorderPoint(parseInt(e.target.value) || 0)}
          onBlur={handleReorderBlur}
          className="w-16 bg-black border border-white/10 rounded px-2 py-1 text-gray-400 focus:outline-none focus:border-emerald-500/50"
        />
      </td>
      <td className="px-6 py-4 font-mono">{item.avg_weekly_sales || 0}</td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md border ${
          stock < reorderPoint 
          ? 'bg-red-500/10 text-red-500 border-red-500/20' 
          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        }`}>
          {stock < reorderPoint ? 'Laag' : 'OK'}
        </span>
      </td>
    </tr>
  );
}
