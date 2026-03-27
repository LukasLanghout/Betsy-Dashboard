// Dit is de tab waar Betsy (onze AI) inkoopvoorstellen doet.
// Ze kijkt naar de voorraad en de verkopen en stelt voor om bij te bestellen.
// We kunnen het voorstel accepteren of handmatig een andere leverancier kiezen.
// Dit is echt het hart van de "inkoop agent" functionaliteit.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, CheckCircle2, ChevronDown, Package, Truck, Euro, Star } from 'lucide-react';

export function ProposalsTab({ proposals, approveOrder, adjustingProposal, setAdjustingProposal }: any) {
  const [customQuantities, setCustomQuantities] = useState<Record<string, number>>({});

  const handleApprove = (prop: any, supplier?: any) => {
    const qty = customQuantities[prop.product_id] || prop.recommended_order;
    approveOrder({ ...prop, recommended_order: qty }, supplier);
  };

  const updateQuantity = (productId: string, val: string) => {
    const num = parseInt(val) || 0;
    setCustomQuantities(prev => ({ ...prev, [productId]: num }));
  };

  return (
    <div className="space-y-6">
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
          {proposals.map((prop: any, idx: number) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#141414] border border-white/10 rounded-2xl p-8 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />
              
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase rounded-md border border-red-500/20">Voorraadtekort Risico</span>
                    <h3 className="text-2xl font-bold text-white">{prop.product_name}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Huidige Voorraad</p>
                      <p className="text-xl font-mono text-white">{prop.current_stock}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Wekelijkse Verkoop</p>
                      <p className="text-xl font-mono text-white">{prop.avg_weekly_sales}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Dagen over</p>
                      <p className="text-xl font-mono text-red-400">{prop.predicted_stockout_days} dagen</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Aantal Bestellen</p>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={customQuantities[prop.product_id] !== undefined ? customQuantities[prop.product_id] : prop.recommended_order}
                          onChange={(e) => updateQuantity(prop.product_id, e.target.value)}
                          className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xl font-mono text-emerald-400 focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                        <span className="text-xs text-gray-600 font-bold uppercase">Units</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <BrainCircuit size={14} className="text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Betsy's Redenering</span>
                    </div>
                    <p className="text-sm text-gray-400 italic leading-relaxed">
                      "{prop.reasoning}"
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-72 bg-white/5 rounded-2xl p-6 border border-white/5">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Voorgestelde Leverancier</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {prop.suggested_supplier.name?.toLowerCase()?.includes('fastfootwear') && (
                          <img src="/FastFootwear.png" alt="FastFootwear" className="h-5 object-contain bg-white rounded px-1" />
                        )}
                        {prop.suggested_supplier.name?.toLowerCase()?.includes('globalsports') && (
                          <img src="/GlobalSports.png" alt="GlobalSports" className="h-5 object-contain bg-white rounded px-1" />
                        )}
                        {prop.suggested_supplier.name?.toLowerCase()?.includes('elitegear') && (
                          <img src="/EliteGear.png" alt="EliteGear" className="h-5 object-contain bg-white rounded px-1" />
                        )}
                        <span className="text-sm text-white font-medium">{prop.suggested_supplier.name}</span>
                      </div>
                      <span className="text-xs text-emerald-500 font-bold">Beste Match</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Stukprijs</span>
                        <span className="text-gray-300">€{Number(prop.suggested_supplier.price || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Levertijd</span>
                        <span className="text-gray-300">{prop.suggested_supplier.delivery_days} dagen</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Betrouwbaarheid</span>
                        <span className="text-gray-300">{((prop.suggested_supplier.reliability_score || 0.9) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleApprove(prop)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      Inkooporder Goedkeuren
                    </button>
                    <button 
                      onClick={() => setAdjustingProposal(prop.product_id)}
                      className="w-full bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-2 rounded-lg transition-all"
                    >
                      Handmatig Aanpassen
                    </button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {adjustingProposal === prop.product_id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5 bg-black/20 p-8 mt-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-sm font-bold text-white uppercase tracking-widest">Handmatige Leverancier Vergelijking</h4>
                      <button 
                        onClick={() => setAdjustingProposal(null)}
                        className="text-xs text-gray-500 hover:text-white"
                      >
                        Sluit Vergelijking
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* AI Keuze */}
                      <div className="bg-emerald-500/5 border-2 border-emerald-500/30 rounded-xl p-6 relative">
                        <div className="absolute top-4 right-4 text-[8px] font-bold bg-emerald-500 text-black px-2 py-0.5 rounded uppercase">AI Keuze</div>
                        <div className="flex items-center gap-2 mb-4">
                          {prop.suggested_supplier.name?.toLowerCase()?.includes('fastfootwear') && (
                            <img src="/FastFootwear.png" alt="FastFootwear" className="h-6 object-contain bg-white rounded px-1" />
                          )}
                          {prop.suggested_supplier.name?.toLowerCase()?.includes('globalsports') && (
                            <img src="/GlobalSports.png" alt="GlobalSports" className="h-6 object-contain bg-white rounded px-1" />
                          )}
                          {prop.suggested_supplier.name?.toLowerCase()?.includes('elitegear') && (
                            <img src="/EliteGear.png" alt="EliteGear" className="h-6 object-contain bg-white rounded px-1" />
                          )}
                          <h5 className="font-bold text-white">{prop.suggested_supplier.name}</h5>
                        </div>
                        <div className="space-y-2 mb-6">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Prijs</span>
                            <span className="text-white font-mono">€{Number(prop.suggested_supplier.price || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Levertijd</span>
                            <span className="text-white font-mono">{prop.suggested_supplier.delivery_days}d</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Betrouwbaarheid</span>
                            <span className="text-white font-mono">{((prop.suggested_supplier.reliability_score || 0.9) * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleApprove(prop, prop.suggested_supplier)}
                          className="w-full py-2 bg-emerald-500 text-black text-xs font-bold rounded-lg hover:bg-emerald-400 transition-colors"
                        >
                          Selecteer AI Keuze
                        </button>
                      </div>

                      {/* Alternatieven */}
                      {prop.alternatives?.map((alt: any, aIdx: number) => (
                        <div key={aIdx} className="bg-white/5 border border-white/10 rounded-xl p-6">
                          <div className="flex items-center gap-2 mb-4">
                            {alt.name?.toLowerCase()?.includes('fastfootwear') && (
                              <img src="/FastFootwear.png" alt="FastFootwear" className="h-6 object-contain bg-white rounded px-1" />
                            )}
                            {alt.name?.toLowerCase()?.includes('globalsports') && (
                              <img src="/GlobalSports.png" alt="GlobalSports" className="h-6 object-contain bg-white rounded px-1" />
                            )}
                            {alt.name?.toLowerCase()?.includes('elitegear') && (
                              <img src="/EliteGear.png" alt="EliteGear" className="h-6 object-contain bg-white rounded px-1" />
                            )}
                            <h5 className="font-bold text-white">{alt.name}</h5>
                          </div>
                          <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Prijs</span>
                              <span className="text-white font-mono">€{Number(alt.price || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Levertijd</span>
                              <span className="text-white font-mono">{alt.delivery_days}d</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Betrouwbaarheid</span>
                              <span className="text-white font-mono">{((alt.reliability_score || 0.9) * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleApprove(prop, alt)}
                            className="w-full py-2 bg-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/20 transition-colors"
                          >
                            Selecteer {alt.name}
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
