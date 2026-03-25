// Dit is de zijbalk van onze app. 
// Ik heb geprobeerd om het overzichtelijk te houden voor de gebruiker.
// Gemaakt voor het project Supply Chain Management.

import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  BrainCircuit,
  History,
  FileText,
  User,
  LogOut,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  setIsLoggedIn: (val: boolean) => void;
  proposalsCount?: number;
  invoicesIssueCount?: number;
}

export function Sidebar({ activeTab, setActiveTab, setIsLoggedIn, proposalsCount, invoicesIssueCount }: SidebarProps) {
  // Hier renderen we de zijbalk met alle navigatie opties
  return (
    <aside className="w-64 border-r border-white/5 bg-[#0d0d0d] flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        {/* Ons logo, als het niet laadt proberen we een andere extensie */}
        <img src="/betsy-logo.jpg" alt="Betsy AI Logo" className="h-10 object-contain rounded-lg" onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src.endsWith('.jpg')) {
            target.src = '/betsy-logo.png';
          } else if (target.src.endsWith('.png')) {
            target.src = '/betsy-logo.jpeg';
          } else {
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }
        }} />
        <div className="hidden flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-white tracking-tight">Betsy AI</span>
        </div>
      </div>

      {/* De navigatie knoppen */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <NavItem 
          icon={<LayoutDashboard size={20} />} 
          label="Overzicht" 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
        />
        <NavItem 
          icon={<BarChart3 size={20} />} 
          label="Verkoop Analyse" 
          active={activeTab === 'sales'} 
          onClick={() => setActiveTab('sales')} 
        />
        <NavItem 
          icon={<BrainCircuit size={20} />} 
          label="AI Proposals" 
          active={activeTab === 'proposals'} 
          onClick={() => setActiveTab('proposals')} 
          badge={proposalsCount}
        />
        <NavItem 
          icon={<History size={20} />} 
          label="Bestelgeschiedenis" 
          active={activeTab === 'orders'} 
          onClick={() => setActiveTab('orders')} 
        />
        <NavItem 
          icon={<FileText size={20} />} 
          label="Facturen" 
          active={activeTab === 'invoices'} 
          onClick={() => setActiveTab('invoices')} 
          badge={invoicesIssueCount}
        />
        <NavItem 
          icon={<User size={20} />} 
          label="Klanten" 
          active={activeTab === 'customers'} 
          onClick={() => setActiveTab('customers')} 
        />
        <div className="pt-4 pb-2">
          <p className="px-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Voorraad</p>
        </div>
        <NavItem 
          icon={<Package size={20} />} 
          label="Voorraadniveaus" 
          active={activeTab === 'inventory'}
          onClick={() => setActiveTab('inventory')} 
        />
        <NavItem 
          icon={<Truck size={20} />} 
          label="Leveranciers" 
          active={activeTab === 'suppliers'}
          onClick={() => setActiveTab('suppliers')} 
        />
      </nav>

      {/* Gebruikersprofiel onderaan */}
      <div className="p-4 mt-auto border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
            LM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Lucas Manager</p>
            <p className="text-xs text-gray-500 truncate">SportWinkel #42</p>
          </div>
          <LogOut size={16} className="text-gray-600" onClick={() => setIsLoggedIn(false)} />
        </div>
      </div>
    </aside>
  );
}

// Een simpel componentje voor elk item in het menu
function NavItem({ icon, label, active, onClick, badge }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void, badge?: number }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
      }`}
    >
      {icon}
      <span className="text-sm font-medium flex-1 text-left">{label}</span>
      {/* Als er een badge is (zoals bij nieuwe voorstellen), laten we die zien */}
      {badge !== undefined && badge > 0 && (
        <span className="bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}
