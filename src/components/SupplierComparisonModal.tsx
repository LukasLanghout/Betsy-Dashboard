import { useState, useEffect } from 'react';
import { X, Package, Truck, ShieldCheck, DollarSign, Loader2, CheckCircle2, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SupplierComparisonModalProps {
  product: any;
  onClose: () => void;
  onOrderCreated?: () => void;
}

export function SupplierComparisonModal({ product, onClose, onOrderCreated }: SupplierComparisonModalProps) {
  const [availableSuppliers, setAvailableSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingPO, setCreatingPO] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSupplierPrices() {
      if (!product) return;
      
      try {
        const { data, error } = await supabase
          .from('supplier_prices')
          .select(`
            price,
            delivery_days,
            supplier_id,
            suppliers ( name, reliability_score )
          `)
          .eq('product_id', product.product_id || product.id)
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

          // Calculate recommendations
          const withRecommendations = formatted.map((s, idx, arr) => {
            const reasons = [];
            
            const isCheapest = s.price === Math.min(...arr.map(a => a.price));
            const isFastest = s.delivery_days === Math.min(...arr.map(a => a.delivery_days));
            const isMostReliable = s.reliability_score === Math.max(...arr.map(a => a.reliability_score));

            if (isCheapest) reasons.push("Best Price");
            if (isFastest) reasons.push("Fastest Delivery");
            if (isMostReliable && s.reliability_score > 90) reasons.push("Most Reliable");

            // Overall score calculation (normalized 0-1)
            const maxPrice = Math.max(...arr.map(a => a.price));
            const minPrice = Math.min(...arr.map(a => a.price));
            const maxDays = Math.max(...arr.map(a => a.delivery_days));
            const minDays = Math.min(...arr.map(a => a.delivery_days));
            
            const priceScore = maxPrice === minPrice ? 1 : (maxPrice - s.price) / (maxPrice - minPrice);
            const timeScore = maxDays === minDays ? 1 : (maxDays - s.delivery_days) / (maxDays - minDays);
            const reliabilityScore = s.reliability_score / 100;

            const overallScore = (priceScore * 0.5) + (timeScore * 0.2) + (reliabilityScore * 0.3);
            
            return { ...s, reasons, overallScore };
          });

          // Sort by overall score for the "Best Overall" badge
          const sorted = [...withRecommendations].sort((a, b) => b.overallScore - a.overallScore);
          if (sorted.length > 0) {
            const bestId = sorted[0].supplierId;
            const final = withRecommendations.map(s => {
              if (s.supplierId === bestId && sorted.length > 1) {
                return { ...s, isBestOverall: true };
              }
              return s;
            });
            setAvailableSuppliers(final);
          } else {
            setAvailableSuppliers(withRecommendations);
          }
        }
      } catch (error) {
        console.error("Fout bij ophalen van supplier prijzen:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSupplierPrices();
  }, [product]);

  const handleCreatePO = async (supplier: any) => {
    setCreatingPO(supplier.supplierId);
    try {
      const quantity = product.reorder_quantity || 50;
      const { error } = await supabase
        .from('orders')
        .insert({
          product_id: product.product_id || product.id,
          supplier_id: supplier.supplierId,
          quantity: quantity,
          status: 'pending',
          total_price: supplier.price * quantity,
          order_date: new Date().toISOString()
        });

      if (error) throw error;

      setSuccessMessage(`PO successfully created for ${supplier.supplierName}!`);
      if (onOrderCreated) onOrderCreated();
      
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error creating PO:", error);
      alert("Failed to create Purchase Order. Please try again.");
    } finally {
      setCreatingPO(null);
    }
  };

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
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 animate-in fade-in slide-in-from-top-4">
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          )}

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
                      <td className="py-4 pr-4">
                        <div className="font-medium text-white">{supplier.supplierName}</div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {supplier.reasons.map((reason: string) => (
                            <span key={reason} className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              reason === 'Best Price' ? 'bg-emerald-500/20 text-emerald-400' :
                              reason === 'Fastest Delivery' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {reason}
                            </span>
                          ))}
                          {supplier.isBestOverall && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                              Best Overall Choice
                            </span>
                          )}
                        </div>
                        {supplier.isBestOverall && (
                          <div className="mt-2 flex items-start gap-1.5 text-[10px] text-gray-400 bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10">
                            <Info className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                            <p>Recommended based on optimal balance of price, speed, and reliability.</p>
                          </div>
                        )}
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
                        <button 
                          onClick={() => handleCreatePO(supplier)}
                          disabled={creatingPO !== null}
                          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all active:scale-95 flex items-center gap-2 ml-auto"
                        >
                          {creatingPO === supplier.supplierId ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create PO'
                          )}
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
