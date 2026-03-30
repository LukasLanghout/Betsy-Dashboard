// Dit is onze AI-assistent Betsy. 
// Ze gebruikt de Groq API (Llama 3.3) om slimme inzichten te geven.
// Ik heb een retry-loop toegevoegd voor als de API even niet meewerkt.
// De prompt is nu zo ingesteld dat ze in het Nederlands antwoordt.

import { useState, useEffect, useRef } from 'react';
import { BrainCircuit, Loader2, Sparkles, AlertCircle, Send, User, Bot, RefreshCcw } from 'lucide-react';
import { generateGroqCompletion, hasGroqConfig } from '../lib/groq';
import ReactMarkdown from 'react-markdown';

interface AIInsightsProps {
  inventory: any[];
  suppliers: any[];
  orders: any[];
  invoices?: any[];
  proposals?: any[];
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function AIInsights({ inventory, suppliers, orders, invoices = [], proposals = [] }: AIInsightsProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "Welke producten moeten nu besteld worden?",
    "Hoe betrouwbaar zijn mijn leveranciers?",
    "Wat is de totale waarde van mijn voorraad?",
    "Zijn er afwijkingen in mijn facturen?"
  ];

  // Helper om data samen te vatten voor de AI
  const getDataSummary = () => {
    const lowStockItems = inventory.filter(i => (i.stock_level || 0) < (i.reorder_point || 0));
    const criticalStock = inventory.filter(i => (i.stock_level || 0) <= (i.reorder_point || 0) * 0.5);
    const topSuppliers = suppliers.sort((a, b) => (b.reliability_score || 0) - (a.reliability_score || 0)).slice(0, 5);
    const pendingOrders = orders.find(o => o.stage === 'Pending')?.count || 0;
    const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.stock_level * (item.unit_price || item.base_price || 0)), 0);
    const topProductsBySales = [...inventory].sort((a, b) => (b.avg_weekly_sales || 0) - (a.avg_weekly_sales || 0)).slice(0, 5);
    const invoiceAnomalies = invoices.filter(inv => inv.ai_check_status === 'error_detected').length;

    // Volledige inventarislijst voor de AI (compact geformatteerd)
    const inventoryList = inventory.map(i => 
      `${i.name}: Voorraad=${i.stock_level}, Bestelpunt=${i.reorder_point}, Verkoop=${i.avg_weekly_sales}/wk`
    ).join(' | ');

    return `
      Huidige Status van de Supply Chain:
      - Volledige Voorraadlijst: ${inventoryList}
      - Lage Voorraad: ${lowStockItems.length} items (${lowStockItems.map(i => i.name).join(', ')})
      - KRITIEKE Voorraad (minder dan 50% van bestelpunt): ${criticalStock.length} items (${criticalStock.map(i => i.name).join(', ')})
      - Totaal aantal unieke producten: ${inventory.length}
      - Totale voorraadwaarde: €${totalInventoryValue.toLocaleString('nl-NL')}
      - Openstaande Bestellingen: ${pendingOrders}
      - Openstaande Inkoopvoorstellen (Proposals): ${proposals.length}
      - Factuur Afwijkingen gedetecteerd: ${invoiceAnomalies}
      - Top Producten (op basis van wekelijkse verkoop): ${topProductsBySales.map(p => `${p.name} (${p.avg_weekly_sales}/week)`).join(', ')}
      - Top Leveranciers: ${topSuppliers.map(s => `${s.name} (${(s.reliability_score * 100).toFixed(0)}% betrouwbaarheid, levertijd ${s.delivery_days} dagen)`).join(', ')}
    `;
  };

  // Initiële inzichten genereren
  useEffect(() => {
    async function generateInitialInsights() {
      if (!hasGroqConfig || messages.length > 0) return;
      if (inventory.length === 0 && suppliers.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        const summary = getDataSummary();
        const response = await generateGroqCompletion([
          {
            role: "system",
            content: "Je bent Betsy, een AI operations consultant voor een sportwinkelketen. Je geeft data-gedreven, high-impact executive inzichten. Gebruik dikgedrukte tekst voor belangrijke getallen. Wees direct en actiegericht. De output moet in het Nederlands zijn. Gebruik koppen (###) voor structuur."
          },
          {
            role: "user",
            content: `Analyseer deze supply chain data en geef me een beknopt overzicht van de 3 meest kritieke actiepunten en kansen: ${summary}`
          }
        ]);

        const text = response?.choices?.[0]?.message?.content || '';
        setMessages([{ role: 'assistant', content: text }]);
      } catch (err: any) {
        setError(err.message || 'Kon geen verbinding maken met Betsy AI.');
      } finally {
        setLoading(false);
      }
    }

    generateInitialInsights();
  }, [inventory, suppliers, orders]);

  // Scroll naar beneden bij nieuwe berichten
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (e?: React.FormEvent, directMessage?: string) => {
    e?.preventDefault();
    const messageToSend = directMessage || inputValue.trim();
    if (!messageToSend || loading) return;

    if (!directMessage) setInputValue('');
    const newMessages: Message[] = [...messages, { role: 'user', content: messageToSend }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const summary = getDataSummary();
      const apiMessages: Message[] = [
        {
          role: "system",
          content: `Je bent Betsy, de AI-assistent van dit dashboard. Je hebt toegang tot de volgende real-time data: ${summary}. Beantwoord vragen van de gebruiker over de voorraad, leveranciers, bestellingen, facturen en inkoopvoorstellen op een professionele, behulpzame manier in het Nederlands. Gebruik Markdown voor formatting. Als je iets niet weet op basis van de data, geef dat dan eerlijk aan.`
        },
        ...newMessages
      ];

      const response = await generateGroqCompletion(apiMessages);
      const assistantText = response?.choices?.[0]?.message?.content || '';
      setMessages([...newMessages, { role: 'assistant', content: assistantText }]);
    } catch (err: any) {
      setError('Er ging iets mis bij het verwerken van je vraag.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-700/50 rounded-3xl p-8 h-full flex flex-col shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-inner">
            <img src="/betsy-logo.png" alt="Betsy AI" className="w-10 h-10 object-contain" onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }} />
            <BrainCircuit className="hidden w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white text-2xl font-bold flex items-center gap-2">
              Betsy AI Assistent
              <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            </h3>
            <p className="text-slate-400 text-base">Gekoppeld aan je live voorraad & data</p>
          </div>
        </div>
        <button 
          onClick={() => setMessages([])}
          className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          title="Gesprek wissen"
        >
          <RefreshCcw size={22} />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-2 mb-6 custom-scrollbar space-y-8"
      >
        {messages.length === 0 && !loading && !error && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center px-4">
            <BrainCircuit className="w-16 h-16 mb-6 opacity-20" />
            <p className="text-xl mb-8">Stel een vraag aan Betsy over je voorraad of leveranciers.</p>
            <div className="grid grid-cols-1 gap-3 w-full max-w-md">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(undefined, q)}
                  className="text-left px-5 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-indigo-600/20 hover:border-indigo-500/50 transition-all text-base"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-4 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'
              }`}>
                {msg.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-indigo-400" />}
              </div>
              <div className={`rounded-2xl px-6 py-4 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-none'
              }`}>
                <div className="prose prose-invert prose-lg max-w-none leading-relaxed">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-4 items-center bg-slate-800/50 rounded-2xl px-6 py-4 border border-slate-700/30">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              <span className="text-slate-400 text-lg italic">Betsy is aan het nadenken...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 flex items-start gap-4 text-rose-400">
            <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-lg font-semibold">Er is een fout opgetreden</p>
              <p className="text-sm opacity-80">{error}</p>
              <button 
                onClick={() => setMessages([])}
                className="mt-3 text-sm underline hover:no-underline"
              >
                Probeer opnieuw
              </button>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="relative mt-auto">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Stel een vraag aan Betsy..."
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl py-5 pl-8 pr-16 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-lg placeholder:text-slate-500 shadow-lg"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="absolute right-3 top-3 bottom-3 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl transition-all flex items-center justify-center shadow-md"
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
}
