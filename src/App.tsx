/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Package, AlertTriangle, CheckCircle2, Filter, BrainCircuit } from 'lucide-react';
import { KPICard } from './components/KPICard';
import { StockOutPredictor } from './components/StockOutPredictor';
import { SupplierScorecard } from './components/SupplierScorecard';
import { OrderPipeline } from './components/OrderPipeline';
import { LowStockAlerts } from './components/LowStockAlerts';
import { SupplierComparisonModal } from './components/SupplierComparisonModal';
import { inventoryData, supplierData, orderPipelineData, invoiceData } from './data/mockData';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('All');
  const [drillDownProduct, setDrillDownProduct] = useState<any | null>(null);

  // Derived Data & KPIs
  const categories = ['All', ...Array.from(new Set(inventoryData.map(item => item.category)))];
  const suppliers = ['All', ...supplierData.map(s => s.name)];

  const filteredInventory = useMemo(() => {
    return inventoryData.filter(item => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      // Supplier filter would require joining with supplierPrices, simplifying for UI demo
      return true;
    });
  }, [selectedCategory, selectedSupplier]);

  const inventoryValue = filteredInventory.reduce((sum, item) => sum + (item.stock_level * item.base_price), 0);
  const riskLevel = filteredInventory.filter(item => item.stock_level < item.reorder_point).length;
  
  const cleanInvoices = invoiceData.filter(inv => inv.ai_check_status === 'verified_clean').length;
  const aiAccuracy = Math.round((cleanInvoices / invoiceData.length) * 100);

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
                {suppliers.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
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
            trend="-1"
            trendUp={true}
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
          <SupplierScorecard data={supplierData} />
          <OrderPipeline data={orderPipelineData} />
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
