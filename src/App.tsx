import { useState, useEffect, useMemo } from 'react';
import { Package, AlertTriangle, CheckCircle2, Filter, BrainCircuit, Loader2, Database, History, Trash2 } from 'lucide-react';
import { KPICard } from './components/KPICard';
import { StockOutPredictor } from './components/StockOutPredictor';
import { SupplierScorecard } from './components/SupplierScorecard';
import { OrderPipeline } from './components/OrderPipeline';
import { LowStockAlerts } from './components/LowStockAlerts';
import { SupplierComparisonModal } from './components/SupplierComparisonModal';
import { AIInsights } from './components/AIInsights';
import { supabase, hasSupabaseConfig } from './lib/supabase';
import { GoogleGenAI } from "@google/genai";

import { Sidebar } from './components/Sidebar';
import { LoginScreen } from './components/LoginScreen';
import { InventoryTab } from './components/tabs/InventoryTab';
import { SuppliersTab } from './components/tabs/SuppliersTab';
import { OrdersTab } from './components/tabs/OrdersTab';
import { ProposalsTab } from './components/tabs/ProposalsTab';
import { InvoicesTab } from './components/tabs/InvoicesTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'proposals' | 'orders' | 'inventory' | 'suppliers' | 'invoices'>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [inventory, setInventory] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [rawOrders, setRawOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [adjustingProposal, setAdjustingProposal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('All');
  const [drillDownProduct, setDrillDownProduct] = useState<any | null>(null);

  const fetchData = async () => {
    if (!hasSupabaseConfig) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      const [
        { data: invData },
        { data: supData },
        { data: ordData },
        { data: invcData },
        { data: supPricesData }
      ] = await Promise.all([
        supabase.from('inventory').select('*, products(*)'),
        supabase.from('suppliers').select('*'),
        supabase.from('orders').select('*, products(*), suppliers(*)').order('id', { ascending: false }),
        supabase.from('invoices').select('*').order('id', { ascending: false }),
        supabase.from('supplier_prices').select('*')
      ]);

      const formattedInventory = (invData || []).map((item: any) => {
        const product = Array.isArray(item.products) ? item.products[0] : item.products;
        return {
          ...item,
          name: product?.name || 'Unknown Product',
          category: product?.category || 'Uncategorized',
          base_price: product?.base_price || 0,
        };
      });
      setInventory(formattedInventory);

      const formattedSuppliers = (supData || []).map((sup: any) => {
        const prices = (supPricesData || []).filter((p: any) => p.supplier_id === sup.id);
        const avgDelivery = prices.length ? prices.reduce((sum: number, p: any) => sum + p.delivery_days, 0) / prices.length : 5;
        const avgPrice = prices.length ? prices.reduce((sum: number, p: any) => sum + p.price, 0) / prices.length : 100;
        
        return {
          ...sup,
          delivery_days: avgDelivery,
          avg_price_index: avgPrice,
          reliability_score: sup.reliability_score || 0.9
        };
      });
      setSuppliers(formattedSuppliers);
      
      const formattedInvoices = (invcData || []).map((inv: any) => {
        let parsedItems = inv.items;
        if (typeof parsedItems === 'string') {
          try {
            parsedItems = JSON.parse(parsedItems);
          } catch (e) {
            parsedItems = [];
          }
        }
        return {
          ...inv,
          items: parsedItems
        };
      });
      setInvoices(formattedInvoices);

      if (ordData) {
        setRawOrders(ordData);
        const pipeline = ordData.reduce((acc: any, order: any) => {
          const statusRaw = order.status || 'pending';
          const status = statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1);
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        
        const stageOrder = ['Pending', 'Approved', 'Processing', 'Shipped', 'Delivered'];
        const formattedPipeline = stageOrder.map(stage => ({
          stage,
          count: pipeline[stage] || 0
        })).filter(item => item.count > 0);
        
        Object.keys(pipeline).forEach(key => {
          if (!stageOrder.includes(key) && pipeline[key] > 0) {
            formattedPipeline.push({ stage: key, count: pipeline[key] });
          }
        });
        
        setOrders(formattedPipeline.length > 0 ? formattedPipeline : []);
      }

      // Generate Proposals based on inventory
      const newProposals = formattedInventory
        .filter(item => item.stock_level < item.reorder_point)
        .map(item => {
          const productId = item.product_id || item.id;
          const predicted_stockout_days = Math.max(1, Math.floor((item.stock_level / (item.avg_weekly_sales || 10)) * 7));
          
          // Find specific supplier prices for this product
          let productSuppliers = (supPricesData || [])
            .filter((sp: any) => sp.product_id === productId)
            .map((sp: any) => {
              const supplier = (supData || []).find((s: any) => s.id === sp.supplier_id);
              return {
                id: supplier?.id,
                name: supplier?.name || 'Unknown',
                price: sp.price || item.base_price || 10,
                delivery_days: sp.delivery_days || 5,
                reliability_score: supplier?.reliability_score || 0.9,
                contact: supplier?.contact
              };
            })
            .filter((s: any) => s.id); // Ensure we found a supplier

          // Sort productSuppliers to find the best one
          productSuppliers.sort((a: any, b: any) => {
            const isEmergency = predicted_stockout_days <= Math.min(a.delivery_days, b.delivery_days) + 2;
            if (isEmergency) {
              // Prioritize delivery days, then price
              if (a.delivery_days !== b.delivery_days) return a.delivery_days - b.delivery_days;
              return a.price - b.price;
            } else {
              // Prioritize price, then reliability
              if (a.price !== b.price) return a.price - b.price;
              return b.reliability_score - a.reliability_score;
            }
          });

          // Fallback if no specific prices found
          if (productSuppliers.length === 0) {
            productSuppliers = formattedSuppliers.map(s => ({
              id: s.id,
              name: s.name,
              price: item.base_price || 10,
              delivery_days: s.delivery_days || 5,
              reliability_score: s.reliability_score || 0.9,
              contact: s.contact
            }));
          }

          const suggestedSupplier = productSuppliers[0] || { name: 'Default', price: 10, delivery_days: 5, reliability_score: 0.9 };
          const alternatives = productSuppliers.slice(1, 4);

          return {
            product_id: productId,
            product_name: item.name,
            current_stock: item.stock_level,
            avg_weekly_sales: item.avg_weekly_sales || 10,
            predicted_stockout_days,
            reorder_point: item.reorder_point,
            recommended_order: Math.max(1, (item.reorder_point * 2) - item.stock_level),
            suggested_supplier: suggestedSupplier,
            alternatives: alternatives,
            reasoning: "Analyzing..."
          };
        });
      
      setProposals(newProposals);

      // Generate AI Reasoning for proposals
      newProposals.forEach(async (prop: any) => {
        try {
          const generateFallbackReasoning = () => {
            const isEmergency = prop.predicted_stockout_days <= prop.suggested_supplier.delivery_days + 2;
            if (isEmergency) {
              return `Betsy (Smart) Alert: Stockout expected in ${prop.predicted_stockout_days} days. I've prioritized ${prop.suggested_supplier.name} for their speed (${prop.suggested_supplier.delivery_days} days) to ensure continuity.`;
            } else {
              return `Betsy (Smart) Analysis: Selected ${prop.suggested_supplier.name} (€${prop.suggested_supplier.price}) as the most reliable option for delivery within ${prop.suggested_supplier.delivery_days} days.`;
            }
          };

          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey || apiKey === "undefined") {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setProposals(prev => prev.map(p => p.product_id === prop.product_id ? { ...p, reasoning: generateFallbackReasoning() } : p));
            return;
          }

          const ai = new GoogleGenAI({ apiKey });
          const prompt = `You are Betsy, an AI Inventory Manager. 
          Product: ${prop.product_name}
          Current Stock: ${prop.current_stock}
          Avg Weekly Sales: ${prop.avg_weekly_sales}
          Days until stockout: ${prop.predicted_stockout_days}
          Suggested Supplier: ${prop.suggested_supplier.name} (Price: €${prop.suggested_supplier.price}, Delivery: ${prop.suggested_supplier.delivery_days} days, Reliability: ${prop.suggested_supplier.reliability_score * 100}%)
          Alternatives: ${prop.alternatives?.map((a: any) => `${a.name} (Price: €${a.price}, Delivery: ${a.delivery_days} days)`).join(', ')}
          
          Write a short, professional reasoning (max 2 sentences) for why you picked the suggested supplier. 
          Mention specific prices and delivery times to justify the choice. 
          Start with "Betsy (Gemini) Analysis:" or "Betsy (Gemini) Alert:".`;

          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
          });

          setProposals(prev => prev.map(p => p.product_id === prop.product_id ? { ...p, reasoning: response.text || generateFallbackReasoning() } : p));
        } catch (err) {
          console.error("AI Generation Error:", err);
          setProposals(prev => prev.map(p => p.product_id === prop.product_id ? { ...p, reasoning: `Betsy (System) Alert: Emergency order for ${prop.product_name}. Prioritizing ${prop.suggested_supplier.name} for speed.` } : p));
        }
      });

    } catch (error) {
      console.error("Fout bij het ophalen van Supabase data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const updateStock = async (productId: number, newStock: number) => {
    try {
      const { error } = await supabase.from('inventory').update({ stock_level: newStock }).eq('product_id', productId);
      if (!error) fetchData();
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const updateReorderPoint = async (productId: number, newPoint: number) => {
    try {
      const { error } = await supabase.from('inventory').update({ reorder_point: newPoint }).eq('product_id', productId);
      if (!error) fetchData();
    } catch (error) {
      console.error('Error updating reorder point:', error);
    }
  };

  const deliverOrder = async (order: any) => {
    try {
      const { error } = await supabase.from('orders').update({ status: 'delivered' }).eq('id', order.id);
      if (!error) {
        // Update stock level
        const currentItem = inventory.find((item: any) => item.product_id === order.product_id);
        if (currentItem) {
          const newStock = (currentItem.stock_level || 0) + (order.quantity || 0);
          await supabase.from('inventory').update({ stock_level: newStock }).eq('product_id', order.product_id);
        }

        // Create Invoice
        const vendorName = order.suppliers?.name || order.supplier_name || 'Unknown Supplier';
        const invoiceNumber = `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        
        const productData = Array.isArray(order.products) ? order.products[0] : order.products;
        const basePrice = productData?.base_price || 50;
        
        const subtotal = (order.quantity || 0) * basePrice;
        const taxPercentage = 21;
        const totalAmount = subtotal * (1 + taxPercentage / 100);

        const { error: insertError } = await supabase.from('invoices').insert({
          id: `inv-${Date.now()}`,
          invoice_number: invoiceNumber,
          order_id: order.id,
          vendor: vendorName,
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          subtotal: subtotal,
          tax_percentage: taxPercentage,
          total_amount: totalAmount,
          ai_check_status: 'verified_clean',
          items: [{
            product_name: productData?.name || 'Unknown Product',
            quantity: order.quantity || 0,
            unit_price: basePrice,
            total: subtotal
          }]
        });

        if (insertError) {
          console.error("Insert error:", insertError);
          alert("Failed to create invoice: " + JSON.stringify(insertError));
        }

        fetchData();
      }
    } catch (error) {
      console.error('Error delivering order:', error);
    }
  };

  const updateInvoice = async (updatedInvoice: any) => {
    try {
      const { error } = await supabase.from('invoices').update(updatedInvoice).eq('id', updatedInvoice.id);
      if (!error) {
        setSelectedInvoice(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  const approveOrder = async (proposal: any, selectedSupplier?: any) => {
    const supplier = selectedSupplier || proposal.suggested_supplier;
    try {
      const { error } = await supabase.from('orders').insert({
        product_id: proposal.product_id,
        supplier_id: supplier.id || supplier.supplier_id,
        quantity: proposal.recommended_order,
        status: 'pending',
        order_date: new Date().toISOString()
      });
      if (!error) {
        setProposals(prev => prev.filter(p => p.product_id !== proposal.product_id));
        fetchData();
        setActiveTab('orders');
        setAdjustingProposal(null);
      }
    } catch (error) {
      console.error('Error approving order:', error);
    }
  };

  const resetData = async () => {
    if (!confirm("Are you sure you want to clear all order and invoice history? This cannot be undone.")) return;
    try {
      // In a real app, you'd call a Supabase function or delete rows.
      // For now, we'll just refetch.
      fetchData();
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  // Afgeleide Data & Filters voor Dashboard
  const categories = ['All', ...Array.from(new Set(inventory.map(item => item.category).filter(Boolean)))];
  const supplierNames = ['All', ...suppliers.map(s => s.name).filter(Boolean)];

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      return true;
    });
  }, [inventory, selectedCategory, selectedSupplier]);

  const inventoryValue = filteredInventory.reduce((sum, item) => sum + ((item.stock_level || 0) * (item.base_price || 0)), 0);
  const riskLevel = filteredInventory.filter(item => (item.stock_level || 0) < (item.reorder_point || 0)).length;
  
  const cleanInvoices = invoices.filter(inv => inv.ai_check_status === 'verified_clean' || inv.ai_check_status === 'ok').length;
  const aiAccuracy = invoices.length > 0 ? Math.round((cleanInvoices / invoices.length) * 100) : 0;

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-indigo-400">
        <div className="flex flex-col items-center gap-4">
          <img src="/betsy-logo.png" alt="Betsy AI Logo" className="h-24 object-contain mb-4" onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src.endsWith('.png')) {
              target.src = '/betsy-logo.jpg';
            } else if (target.src.endsWith('.jpg')) {
              target.src = '/betsy-logo.jpeg';
            } else {
              target.style.display = 'none';
            }
          }} />
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium tracking-wider uppercase text-gray-400">Loading Betsy AI Data...</p>
        </div>
      </div>
    );
  }

  if (!hasSupabaseConfig) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-gray-100 p-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-lg w-full text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
            <Database className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-white">Supabase Setup Required</h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            To view your live dashboard, you need to connect your Supabase database. 
            Please add your Supabase URL and Anon Key to the environment variables.
          </p>
          
          <div className="text-left bg-black/40 p-5 rounded-xl border border-white/5 text-xs font-mono text-gray-300 space-y-3">
            <div>
              <span className="text-indigo-400">VITE_SUPABASE_URL</span>=
              <span className="text-emerald-400">"https://your-project.supabase.co"</span>
            </div>
            <div>
              <span className="text-indigo-400">VITE_SUPABASE_ANON_KEY</span>=
              <span className="text-emerald-400">"your-anon-key"</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans selection:bg-indigo-500/30 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        setIsLoggedIn={setIsLoggedIn}
        proposalsCount={proposals.length}
        invoicesIssueCount={invoices.filter(i => i.ai_check_status === 'error').length}
      />

      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-10">
          <h2 className="text-lg font-semibold text-white">
            {activeTab === 'dashboard' && 'Operations Overview'}
            {activeTab === 'proposals' && 'AI Procurement Proposals'}
            {activeTab === 'orders' && 'Order Tracking'}
            {activeTab === 'invoices' && 'Invoice Audit & Verification'}
            {activeTab === 'inventory' && 'Inventory Management'}
            {activeTab === 'suppliers' && 'Supplier Network'}
          </h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchData}
              className="p-2 text-gray-500 hover:text-white transition-colors"
            >
              <History size={18} />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Agent Active</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">Operations Overview</h3>
                  <p className="text-xs text-gray-500 mt-1">Real-time procurement intelligence.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-transparent text-sm text-white outline-none cursor-pointer"
                    >
                      {categories.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                    </select>
                  </div>
                  <button 
                    onClick={resetData}
                    className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Reset System
                  </button>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <KPICard 
                  title="Total Inventory Value" 
                  value={`$${inventoryValue.toLocaleString()}`}
                  icon={<Package className="w-5 h-5" />}
                  trend="+2.4%"
                  trendUp={true}
                />
                <KPICard 
                  title="Risk Level (Low Stock)" 
                  value={riskLevel}
                  icon={<AlertTriangle className="w-5 h-5" />}
                  trend={riskLevel > 0 ? "Action Required" : "Healthy"}
                  trendUp={riskLevel === 0}
                  className={riskLevel > 0 ? "border-rose-500/30 bg-rose-500/5" : ""}
                />
                <KPICard 
                  title="AI Invoice Accuracy" 
                  value={`${aiAccuracy}%`}
                  icon={<CheckCircle2 className="w-5 h-5" />}
                  trend="+5.2%"
                  trendUp={true}
                />
              </div>

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <StockOutPredictor data={filteredInventory} />
                </div>
                <div className="lg:col-span-1 flex flex-col gap-6">
                  <div className="flex-1">
                    <LowStockAlerts 
                      inventory={filteredInventory} 
                      onDrillDown={(product) => setDrillDownProduct(product)} 
                    />
                  </div>
                  <div className="h-[300px]">
                    <AIInsights 
                      inventory={filteredInventory} 
                      suppliers={suppliers} 
                      orders={orders} 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SupplierScorecard data={suppliers} />
                <OrderPipeline data={orders} />
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <InventoryTab 
              inventory={inventory} 
              updateStock={updateStock} 
              updateReorderPoint={updateReorderPoint} 
              fetchData={fetchData} 
            />
          )}

          {activeTab === 'suppliers' && (
            <SuppliersTab suppliers={suppliers} />
          )}

          {activeTab === 'orders' && (
            <OrdersTab orders={rawOrders} deliverOrder={deliverOrder} />
          )}

          {activeTab === 'proposals' && (
            <ProposalsTab 
              proposals={proposals} 
              approveOrder={approveOrder} 
              adjustingProposal={adjustingProposal} 
              setAdjustingProposal={setAdjustingProposal} 
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesTab 
              invoices={invoices} 
              selectedInvoice={selectedInvoice} 
              setSelectedInvoice={setSelectedInvoice} 
              updateInvoice={updateInvoice} 
            />
          )}
        </div>
      </main>

      {/* Drill-down Modal */}
      {drillDownProduct && (
        <SupplierComparisonModal 
          product={drillDownProduct} 
          onClose={() => setDrillDownProduct(null)} 
        />
      )}
    </div>
  );
}
