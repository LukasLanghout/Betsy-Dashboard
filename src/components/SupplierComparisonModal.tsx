import { useState, useEffect } from 'react';
import { X, Package, Truck, ShieldCheck, DollarSign, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SupplierComparisonModalProps {
  product: any;
  onClose: () => void;
}

export function SupplierComparisonModal({ product, onClose }: SupplierComparisonModalProps) {
  const [availableSuppliers, setAvailableSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSupplierPrices() {
      if (!product) return;
      
      try {
        // Haal supplier prijzen op voor dit product en join met de 'suppliers' tabel voor de naam.
        const { data, error } = await supabase
          .from('supplier_prices')
          .select(`
            price,
            delivery_days,
            supplier_id,
            suppliers ( name, reliability_score )
          `)
          .eq('product_id', product.product_id)
          .order('price', { ascending: true });

        if (error) throw error;
        
        if (data) {
          const formatted = data.map((item: any) => {
            const supplierData = Array.isArray(item.suppliers) ? item.suppliers[0] : item.suppliers;
            return {
              ...item,
              supplierName: supplierData?.name || 'Unknown Supplier',
              reliability_score: supplierData?.reliability_score || 0,
              supplierId: item.supplier_id
            };
          });
          setAvailableSuppliers(formatted);
        }
      } catch (error) {
        console.error("Fout bij ophalen van supplier prijzen:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSupplierPrices();
  }, [product]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-semibold text-white">Supplier Comparison</h2>
            <p className="text-sm text-gray-400 mt-1">Sourcing options for <span className="text-indigo-400 font-medium">{product.name}</span></p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : availableSuppliers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No supplier data available for this product.</p>
              <p className="text-xs mt-2 text-gray-500">Check if your 'supplier_prices' table has entries for productId: {product.id}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-3 font-medium text-gray-400 text-sm">Supplier</th>
                    <th className="pb-3 font-medium text-gray-400 text-sm">
                      <div className="flex items-center gap-1.5"><DollarSign className="w-4 h-4"/> Unit Price</div>
                    </th>
                    <th className="pb-3 font-medium text-gray-400 text-sm">
                      <div className="flex items-center gap-1.5"><Truck className="w-4 h-4"/> Lead Time</div>
                    </th>
                    <th className="pb-3 font-medium text-gray-400 text-sm">
                      <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4"/> Reliability</div>
                    </th>
                    <th className="pb-3 font-medium text-gray-400 text-sm text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {availableSuppliers.map((supplier, idx) => (
                    <tr key={supplier.supplierId || idx} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4">
                        <div className="font-medium text-white">{supplier.supplierName}</div>
                        {idx === 0 && <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400">Best Price</span>}
                      </td>
                      <td className="py-4 text-white font-mono">${Number(supplier.price).toFixed(2)}</td>
                      <td className="py-4 text-gray-300">{supplier.delivery_days} days</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${supplier.reliability_score >= 90 ? 'bg-emerald-500' : supplier.reliability_score >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: `${supplier.reliability_score}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-400">{supplier.reliability_score}%</span>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors">
                          Create PO
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
