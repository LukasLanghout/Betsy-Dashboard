import React from 'react';

export function OrdersTab({ orders, deliverOrder }: any) {
  return (
    <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <h3 className="font-semibold text-white">Order History & Tracking</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-white/5">
              <th className="px-6 py-4 font-medium">Order ID</th>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Supplier</th>
              <th className="px-6 py-4 font-medium">Quantity</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((order: any, idx: number) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-gray-400 font-mono text-xs">#PO-{(order.id || idx).toString().padStart(4, '0')}</td>
                <td className="px-6 py-4 text-white font-medium">{order.product_name || `Product ${order.product_id}`}</td>
                <td className="px-6 py-4">{order.supplier_name || `Supplier ${order.supplier_id}`}</td>
                <td className="px-6 py-4">{order.quantity || 0} units</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md border ${
                    order.status === 'pending' 
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                    : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                  }`}>
                    {order.status || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}</td>
                <td className="px-6 py-4">
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => deliverOrder(order.id)}
                      className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-wider"
                    >
                      Mark Delivered
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
