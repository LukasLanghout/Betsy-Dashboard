import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, CheckCircle2 } from 'lucide-react';

export function ProposalsTab({ proposals, approveOrder, adjustingProposal, setAdjustingProposal }: any) {
  return (
    <div className="space-y-6">
      {proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-white">All Stock Levels Healthy</h3>
          <p className="text-gray-500 mt-2 max-w-xs">Betsy is monitoring your inventory. No procurement actions needed right now.</p>
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
                    <span className="px-2 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase rounded-md border border-red-500/20">Stockout Risk</span>
                    <h3 className="text-2xl font-bold text-white">{prop.product_name}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Stock</p>
                      <p className="text-xl font-mono text-white">{prop.current_stock}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Weekly Sales</p>
                      <p className="text-xl font-mono text-white">{prop.avg_weekly_sales}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Days Left</p>
                      <p className="text-xl font-mono text-red-400">{prop.predicted_stockout_days} days</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Recommended</p>
                      <p className="text-xl font-mono text-emerald-400">+{prop.recommended_order}</p>
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <BrainCircuit size={14} className="text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Agent Reasoning</span>
                    </div>
                    <p className="text-sm text-gray-400 italic leading-relaxed">
                      "{prop.reasoning}"
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-72 bg-white/5 rounded-2xl p-6 border border-white/5">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Suggested Supplier</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white font-medium">{prop.suggested_supplier.name}</span>
                      <span className="text-xs text-emerald-500 font-bold">Best Match</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Unit Price</span>
                        <span className="text-gray-300">€{prop.suggested_supplier.price}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Delivery</span>
                        <span className="text-gray-300">{prop.suggested_supplier.delivery_days} days</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Reliability</span>
                        <span className="text-gray-300">{((prop.suggested_supplier.reliability_score || 0.9) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => approveOrder(prop)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      Approve Purchase Order
                    </button>
                    <button 
                      onClick={() => setAdjustingProposal(prop.product_id)}
                      className="w-full bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-2 rounded-lg transition-all"
                    >
                      Adjust Manually
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
                      <h4 className="text-sm font-bold text-white uppercase tracking-widest">Manual Supplier Comparison</h4>
                      <button 
                        onClick={() => setAdjustingProposal(null)}
                        className="text-xs text-gray-500 hover:text-white"
                      >
                        Close Comparison
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* AI Pick */}
                      <div className="bg-emerald-500/5 border-2 border-emerald-500/30 rounded-xl p-6 relative">
                        <div className="absolute top-4 right-4 text-[8px] font-bold bg-emerald-500 text-black px-2 py-0.5 rounded uppercase">AI Choice</div>
                        <h5 className="font-bold text-white mb-4">{prop.suggested_supplier.name}</h5>
                        <div className="space-y-2 mb-6">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Price</span>
                            <span className="text-white font-mono">€{prop.suggested_supplier.price}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Delivery</span>
                            <span className="text-white font-mono">{prop.suggested_supplier.delivery_days}d</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Reliability</span>
                            <span className="text-white font-mono">{((prop.suggested_supplier.reliability_score || 0.9) * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => approveOrder(prop, prop.suggested_supplier)}
                          className="w-full py-2 bg-emerald-500 text-black text-xs font-bold rounded-lg hover:bg-emerald-400 transition-colors"
                        >
                          Select AI Pick
                        </button>
                      </div>

                      {/* Alternatives */}
                      {prop.alternatives?.map((alt: any, aIdx: number) => (
                        <div key={aIdx} className="bg-white/5 border border-white/10 rounded-xl p-6">
                          <h5 className="font-bold text-white mb-4">{alt.name}</h5>
                          <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Price</span>
                              <span className="text-white font-mono">€{alt.price}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Delivery</span>
                              <span className="text-white font-mono">{alt.delivery_days}d</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Reliability</span>
                              <span className="text-white font-mono">{((alt.reliability_score || 0.9) * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => approveOrder(prop, alt)}
                            className="w-full py-2 bg-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/20 transition-colors"
                          >
                            Select {alt.name}
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
