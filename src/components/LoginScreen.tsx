import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <img src="/betsy-logo.png" alt="Betsy AI Logo" className="h-24 object-contain" onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src.endsWith('.png')) {
              target.src = '/betsy-logo.jpg';
            } else if (target.src.endsWith('.jpg')) {
              target.src = '/betsy-logo.jpeg';
            } else {
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }
          }} />
          <div className="hidden w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
            <BrainCircuit className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-2">Betsy AI</h1>
        <p className="text-gray-400 text-center mb-8 text-sm">Autonomous Procurement Agent for SportStores</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Manager ID</label>
            <input 
              type="text" 
              defaultValue="manager_01"
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Password</label>
            <input 
              type="password" 
              defaultValue="••••••••"
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <button 
            onClick={onLogin}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 rounded-xl transition-all transform active:scale-[0.98] mt-4"
          >
            Login to Dashboard
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold">
            <span className="text-gray-600">DB Status</span>
            <span className="text-emerald-500 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Live Connection
            </span>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">
          Prototype v1.0 • Powered by Groq AI
        </p>
      </motion.div>
    </div>
  );
}
