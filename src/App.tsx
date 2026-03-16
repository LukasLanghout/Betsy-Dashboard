import { useState, useEffect, useMemo } from 'react';
import { Package, AlertTriangle, CheckCircle2, Filter, BrainCircuit, Loader2 } from 'lucide-react';
import { KPICard } from './components/KPICard';
import { StockOutPredictor } from './components/StockOutPredictor';
import { SupplierScorecard } from './components/SupplierScorecard';
import { OrderPipeline } from './components/OrderPipeline';
import { LowStockAlerts } from './components/LowStockAlerts';
import { SupplierComparisonModal } from './components/SupplierComparisonModal';
import { supabase } from './lib/supabase';

export default function App() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('All');
  const [drillDownProduct, setDrillDownProduct] = useState<any | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Haal alle data tegelijk (concurrently) op uit Supabase
        const [
          { data: invData },
          { data: supData },
          { data: ordData },
          { data: invcData }
        ] = await Promise.all([
          supabase.from('inventory').select('*'),
          supabase.from('suppliers').select('*'),
          supabase.from('orders').select('*'),
          supabase.from('invoices').select('*')
        ]);

        setInventory(invData || []);
        setSuppliers(supData || []);
        setInvoices(invcData || []);

        // Groepeer orders op 'stage' voor de funnel chart
        if (ordData) {
          const pipeline = ordData.reduce((acc: any, order: any) => {
            const stage = order.stage || 'Pending';
            acc[stage] = (acc[stage] || 0) + 1;
            return acc;
          }, {});
          
          const stageOrder = ['Pending', 'Approved', 'Processing', 'Shipped', 'Delivered'];
          const formattedPipeline = stageOrder.map(stage => ({
            stage,
            count: pipeline[stage] || 0
          })).filter(item => item.count > 0);
          
          setOrders(formattedPipeline.length > 0 ? formattedPipeline : []);
        }
      } catch (error) {
        console.error("Fout bij het ophalen van Supabase data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Afgeleide Data & Filters
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
  
  const cleanInvoices = invoices.filter(inv => inv.ai_check_status === 'verified_clean').length;
  const aiAccuracy = invoices.length > 0 ? Math.round((cleanInvoices / invoices.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-indigo-400">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium tracking-wider uppercase text-gray-400">Loading Betsy AI Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans selection:bg-indigo-500/30">
      {/* Top Navigation / Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Betsy AI</h1>
              <p className="text-xs text-indigo-400 font-medium tracking-wider uppercase">Procurement Intelligence</p>
            </div>
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
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="bg-transparent text-sm text-white outline-none cursor-pointer"
              >
                {supplierNames.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
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
          <div className="lg:col-span-1">
            <LowStockAlerts 
              inventory={filteredInventory} 
              onDrillDown={(product) => setDrillDownProduct(product)} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SupplierScorecard data={suppliers} />
          <OrderPipeline data={orders} />
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
