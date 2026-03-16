import React from 'react';

export function SuppliersTab({ suppliers }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {suppliers.length === 0 ? (
        <div className="col-span-3 py-20 text-center text-gray-500">No suppliers found.</div>
      ) : (
        suppliers.map((s: any, i: number) => (
          <div key={i} className="bg-[#141414] border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-white">{s.name}</h3>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                {((s.reliability_score || 0.9) * 100).toFixed(0)}% Reliable
              </span>
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Contact</span>
                <span className="text-gray-300">{s.contact || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Avg Delivery</span>
                <span className="text-gray-300">{s.delivery_days || 0} days</span>
              </div>
            </div>
            <button className="w-full bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-2 rounded-lg transition-all">
              View Catalog
            </button>
          </div>
        ))
      )}
    </div>
  );
}
