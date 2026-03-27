import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, CheckCircle2, ChevronDown, ChevronUp, Package, Truck, Euro, Star, TrendingUp, TrendingDown, Minus, AlertTriangle, Clock, ShieldCheck } from 'lucide-react';
import type { Proposal } from '../../types';

export function ProposalsTab({ proposals, approveOrder, adjustingProposal, setAdjustingProposal }: any) {
  const [customQuantities, setCustomQuantities] = useState<Record<string, number>>({});
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});

  const handleApprove = (prop: Proposal, supplier?: any) => {
    const qty = customQuantities[prop.product_id] || prop.recommended_order;
    approveOrder({ ...prop, recommended_order: qty }, supplier);
  };

  const updateQuantity = (productId: string, val: string) => {
    const num = parseInt(val) || 0;
    setCustomQuantities(prev => ({ ...prev, [productId]: num }));
  };

  const toggleReasoning = (productId: string) => {
    setExpandedReasoning(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const totalInvestment = proposals.reduce((sum: number, prop: Proposal) => {
    const qty = customQuantities[prop.product_id] || prop.recommended_order;
    return sum + (qty * prop.suggested_supplier.price);
  }, 0);

  const criticalCount = proposals.filter((p: Proposal) => p.urgency === 'critical').length;
  const highCount = proposals.filter((p: Proposal) => p.urgency === 'high').length;

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      {proposals.length > 0 && (
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <Package className="text-emerald-500" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{proposals.length} Inkoopvoorstellen</h2>
              <p className="text-sm text-gray-400">Klaar voor beoordeling</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              {criticalCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertTriangle size={14} className="text-red-500" />
                  <span className="text-xs font-bold text-red-500">{criticalCount} KRITIEK</span>
                </div>
              )}
              {highCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <Clock size={14} className="text-orange-500" />
                  <span className="text-xs font-bold text-orange-500">{highCount} HOOG</span>
                </div>
              )}
            </div>
            <div className="h-10 w-px bg-white/10 hidden md:block"></div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Totale Investering</p>
              <p className="text-2xl font-mono font-bold text-white">€{totalInvestment.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      )}

      {proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-white">Alle Voorraadniveaus zijn Gezond</h3>
          <p className="text-gray-500 mt-2 max-w-xs">Betsy houdt je voorraad in de gaten. Er zijn momenteel geen inkoopacties nodig.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {proposals.map((prop: Proposal, idx: number) => {
            const qty = customQuantities[prop.product_id] !== undefined ? customQuantities[prop.product_id] : prop.recommended_order;
            const currentTotal = qty * prop.suggested_supplier.price;
            const maxPriceSupplier = [...prop.alternatives, prop.suggested_supplier].sort((a, b) => b.price - a.price)[0];
            const maxPrice = maxPriceSupplier ? maxPriceSupplier.price : prop.suggested_supplier.price;
            const currentSavings = (maxPrice - prop.suggested_supplier.price) * qty;

            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#141414] border border-white/10 rounded-2xl relative overflow-hidden group flex flex-col"
              >
                {/* Urgency Gradient Bar */}
                {prop.urgency === 'critical' && <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 to-red-400" />}
                {prop.urgency === 'high' && <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 to-orange-400" />}
                
                <div className="p-6 md:p-8 flex flex-col xl:flex-row gap-8">
                  {/* Left Column: Details & Metrics */}
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <h3 className="text-2xl font-bold text-white">{prop.product_name}</h3>
                      <span className="px-2.5 py-1 bg-white/5 text-gray-300 text-xs font-medium rounded-md border border-white/10">
                        {prop.category}
                      </span>
                      {prop.urgency === 'critical' && (
                        <span className="px-2.5 py-1 bg-red-500/10 text-red-500 text-xs font-bold uppercase rounded-md border border-red-500/20 flex items-center gap-1">
                          <AlertTriangle size={12} /> Kritiek
                        </span>
                      )}
                      {prop.urgency === 'high' && (
                        <span className="px-2.5 py-1 bg-orange-500/10 text-orange-500 text-xs font-bold uppercase rounded-md border border-orange-500/20 flex items-center gap-1">
                          <Clock size={12} /> Hoog
                        </span>
                      )}
                      {prop.urgency === 'medium' && (
                        <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase rounded-md border border-blue-500/20">
                          Medium
                        </span>
                      )}
                    </div>
                    
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Voorraad</p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-xl font-mono text-white">{prop.current_stock}</p>
                          <p className="text-xs text-gray-500">/ {prop.reorder_point} min</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Verkoop/week</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-mono text-white">{prop.avg_weekly_sales}</p>
                          {prop.sales_trend === 'rising' && <div className="flex items-center text-emerald-500 text-xs font-bold"><TrendingUp size={12} className="mr-0.5"/> {Math.round(prop.sales_trend_pct)}%</div>}
                          {prop.sales_trend === 'declining' && <div className="flex items-center text-red-500 text-xs font-bold"><TrendingDown size={12} className="mr-0.5"/> {Math.round(Math.abs(prop.sales_trend_pct))}%</div>}
                          {prop.sales_trend === 'stable' && <div className="flex items-center text-gray-400 text-xs font-bold"><Minus size={12} className="mr-0.5"/> Stabiel</div>}
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Op in</p>
                        <p className={`text-xl font-mono ${prop.predicted_stockout_days <= prop.suggested_supplier.delivery_days ? 'text-red-400' : 'text-white'}`}>
                          {prop.predicted_stockout_days} dgn
                        </p>
                        {prop.predicted_stockout_days <= prop.suggested_supplier.delivery_days && (
                          <p className="text-[10px] text-red-500 font-bold mt-1">Vóór levering!</p>
                        )}
                      </div>

                      <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/20">
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-1">Bestellen</p>
                        <div className="flex items-center gap-1">
                          <input 
                            type="number" 
                            value={qty}
                            onChange={(e) => updateQuantity(String(prop.product_id), e.target.value)}
                            className="w-16 bg-black border border-emerald-500/30 rounded px-2 py-1 text-lg font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors"
                          />
                          <span className="text-xs text-gray-500">stuks</span>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Totaal</p>
                        <p className="text-xl font-mono text-white">€{currentTotal.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        {currentSavings > 0 && (
                          <p className="text-[10px] text-emerald-500 mt-1">Bespaart €{currentSavings.toFixed(2)}</p>
                        )}
                      </div>
                    </div>

                    {/* Insight Chips */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {prop.savings_percentage > 0 && (
                        <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                          <Euro size={12} className="text-emerald-500" />
                          <span className="text-xs text-emerald-400">{Math.round(prop.savings_percentage)}% goedkoper dan duurste leverancier</span>
                        </div>
                      )}
                      <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-1.5">
                        <Truck size={12} className="text-blue-400" />
                        <span className="text-xs text-blue-300">Levering: {prop.estimated_delivery_date}</span>
                      </div>
                      <div className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center gap-1.5">
                        <ShieldCheck size={12} className="text-purple-400" />
                        <span className="text-xs text-purple-300">Na levering: {prop.stock_coverage_after_order} dagen dekking</span>
                      </div>
                      {prop.sales_trend === 'rising' && (
                        <div className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center gap-1.5">
                          <TrendingUp size={12} className="text-yellow-500" />
                          <span className="text-xs text-yellow-400">Verkoop stijgt — overweeg extra voorraad</span>
                        </div>
                      )}
                    </div>

                    {/* AI Reasoning */}
                    <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                      <div 
                        className="p-4 flex items-start justify-between cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => toggleReasoning(String(prop.product_id))}
                      >
                        <div className="flex gap-3">
                          <div className="mt-0.5">
                            <BrainCircuit size={16} className="text-emerald-500" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest block mb-1">Betsy's Analyse</span>
                            <div className={`text-sm text-gray-300 leading-relaxed ${!expandedReasoning[prop.product_id] ? 'line-clamp-2' : ''}`}>
                              {prop.reasoning}
                            </div>
                          </div>
                        </div>
                        <div className="text-gray-500 ml-4 shrink-0">
                          {expandedReasoning[prop.product_id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Supplier Card */}
                  <div className="w-full xl:w-80 shrink-0 flex flex-col gap-4">
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Voorgestelde Leverancier</h4>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-bold uppercase">Beste Keuze</span>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-6">
                        {prop.suggested_supplier.name?.toLowerCase()?.includes('fastfootwear') && (
                          <img src="/FastFootwear.png" alt="FastFootwear" className="h-8 object-contain bg-white rounded p-1" />
                        )}
                        {prop.suggested_supplier.name?.toLowerCase()?.includes('globalsports') && (
                          <img src="/GlobalSports.png" alt="GlobalSports" className="h-8 object-contain bg-white rounded p-1" />
                        )}
                        {prop.suggested_supplier.name?.toLowerCase()?.includes('elitegear') && (
                          <img src="/EliteGear.png" alt="EliteGear" className="h-8 object-contain bg-white rounded p-1" />
                        )}
                        <span className="text-lg text-white font-bold">{prop.suggested_supplier.name}</span>
                      </div>

                      <div className="space-y-4 mb-6 flex-1">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Betrouwbaarheid</span>
                            <span className="text-white font-mono">{((prop.suggested_supplier.reliability_score || 0.9) * 100).toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 bg-black rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${prop.suggested_supplier.reliability_score >= 0.95 ? 'bg-emerald-500' : prop.suggested_supplier.reliability_score >= 0.9 ? 'bg-blue-500' : 'bg-orange-500'}`}
                              style={{ width: `${(prop.suggested_supplier.reliability_score || 0.9) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Stukprijs</span>
                          <span className="text-white font-mono">€{Number(prop.suggested_supplier.price || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Levertijd</span>
                          <span className="text-white font-mono">{prop.suggested_supplier.delivery_days} dagen</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10 mb-6">
                        <div className="flex justify-between items-end">
                          <span className="text-sm text-gray-400">Totale Kosten</span>
                          <span className="text-2xl font-bold text-emerald-400 font-mono">€{currentTotal.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleApprove(prop)}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                      >
                        <CheckCircle2 size={18} />
                        Inkooporder Goedkeuren
                      </button>
                    </div>

                    {/* Quick Alternatives Preview or Compare Button */}
                    {adjustingProposal !== prop.product_id ? (
                      <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-gray-500 uppercase">Alternatieven ({prop.alternatives.length})</span>
                          <button 
                            onClick={() => setAdjustingProposal(prop.product_id)}
                            className="text-xs text-emerald-500 hover:text-emerald-400 font-medium"
                          >
                            Vergelijk Alles
                          </button>
                        </div>
                        <div className="space-y-2">
                          {prop.alternatives.slice(0, 2).map((alt, aIdx) => (
                            <div key={aIdx} className="flex justify-between items-center text-xs">
                              <span className="text-gray-400 truncate max-w-[120px]">{alt.name}</span>
                              <div className="flex gap-3 text-gray-500 font-mono">
                                <span>€{alt.price.toFixed(2)}</span>
                                <span>{alt.delivery_days}d</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setAdjustingProposal(null)}
                        className="w-full py-3 bg-white/5 text-white text-sm font-medium rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                      >
                        Sluit Vergelijking
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Supplier Comparison */}
                <AnimatePresence>
                  {adjustingProposal === prop.product_id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/10 bg-black/30 p-6 md:p-8"
                    >
                      <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Uitgebreide Leverancier Vergelijking</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* AI Keuze */}
                        <div className="bg-emerald-500/5 border-2 border-emerald-500/30 rounded-xl p-6 relative flex flex-col">
                          <div className="absolute top-4 right-4 text-[10px] font-bold bg-emerald-500 text-black px-2 py-1 rounded uppercase">AI Keuze</div>
                          <div className="flex items-center gap-3 mb-6">
                            {prop.suggested_supplier.name?.toLowerCase()?.includes('fastfootwear') && (
                              <img src="/FastFootwear.png" alt="FastFootwear" className="h-8 object-contain bg-white rounded p-1" />
                            )}
                            {prop.suggested_supplier.name?.toLowerCase()?.includes('globalsports') && (
                              <img src="/GlobalSports.png" alt="GlobalSports" className="h-8 object-contain bg-white rounded p-1" />
                            )}
                            {prop.suggested_supplier.name?.toLowerCase()?.includes('elitegear') && (
                              <img src="/EliteGear.png" alt="EliteGear" className="h-8 object-contain bg-white rounded p-1" />
                            )}
                            <h5 className="font-bold text-white text-lg">{prop.suggested_supplier.name}</h5>
                          </div>
                          <div className="space-y-3 mb-6 flex-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Stukprijs</span>
                              <span className="text-white font-mono">€{Number(prop.suggested_supplier.price || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Levertijd</span>
                              <span className="text-white font-mono">{prop.suggested_supplier.delivery_days} dagen</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Betrouwbaarheid</span>
                              <span className="text-white font-mono">{((prop.suggested_supplier.reliability_score || 0.9) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="pt-3 border-t border-white/10 mt-3 flex justify-between items-center">
                              <span className="text-gray-400 text-sm">Totaal ({qty}x)</span>
                              <span className="text-emerald-400 font-bold font-mono text-lg">€{currentTotal.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleApprove(prop, prop.suggested_supplier)}
                            className="w-full py-3 bg-emerald-500 text-black text-sm font-bold rounded-xl hover:bg-emerald-400 transition-colors flex justify-center items-center gap-2"
                          >
                            <CheckCircle2 size={16} />
                            Selecteer AI Keuze
                          </button>
                        </div>

                        {/* Alternatieven */}
                        {prop.alternatives?.map((alt: any, aIdx: number) => {
                          const altTotal = qty * alt.price;
                          const diff = altTotal - currentTotal;
                          
                          return (
                            <div key={aIdx} className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col">
                              <div className="flex items-center gap-3 mb-6">
                                {alt.name?.toLowerCase()?.includes('fastfootwear') && (
                                  <img src="/FastFootwear.png" alt="FastFootwear" className="h-8 object-contain bg-white rounded p-1" />
                                )}
                                {alt.name?.toLowerCase()?.includes('globalsports') && (
                                  <img src="/GlobalSports.png" alt="GlobalSports" className="h-8 object-contain bg-white rounded p-1" />
                                )}
                                {alt.name?.toLowerCase()?.includes('elitegear') && (
                                  <img src="/EliteGear.png" alt="EliteGear" className="h-8 object-contain bg-white rounded p-1" />
                                )}
                                <h5 className="font-bold text-white text-lg">{alt.name}</h5>
                              </div>
                              <div className="space-y-3 mb-6 flex-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Stukprijs</span>
                                  <span className="text-white font-mono">€{Number(alt.price || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Levertijd</span>
                                  <span className="text-white font-mono">{alt.delivery_days} dagen</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Betrouwbaarheid</span>
                                  <span className="text-white font-mono">{((alt.reliability_score || 0.9) * 100).toFixed(0)}%</span>
                                </div>
                                <div className="pt-3 border-t border-white/10 mt-3 flex justify-between items-center">
                                  <span className="text-gray-400 text-sm">Totaal ({qty}x)</span>
                                  <div className="text-right">
                                    <span className="text-white font-bold font-mono text-lg block">€{altTotal.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    <span className={`text-xs font-mono ${diff > 0 ? 'text-red-400' : diff < 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                                      {diff > 0 ? '+' : ''}{diff === 0 ? 'Zelfde prijs' : `€${diff.toFixed(2)}`}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleApprove(prop, alt)}
                                className="w-full py-3 bg-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/20 transition-colors"
                              >
                                Selecteer {alt.name}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
