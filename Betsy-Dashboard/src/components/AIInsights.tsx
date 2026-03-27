// Dit is onze AI-assistent Betsy. 
// Ze gebruikt de Groq API (Llama 3.3) om slimme inzichten te geven.
// Ik heb een retry-loop toegevoegd voor als de API even niet meewerkt.
// De prompt is nu zo ingesteld dat ze in het Nederlands antwoordt.

import { useState, useEffect } from 'react';
import { BrainCircuit, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { generateGroqCompletion, hasGroqConfig } from '../lib/groq';
import ReactMarkdown from 'react-markdown';

interface AIInsightsProps {
  inventory: any[];
  suppliers: any[];
  orders: any[];
}

export function AIInsights({ inventory, suppliers, orders }: AIInsightsProps) {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState<number>(0);

  useEffect(() => {
    async function generateInsights() {
      if (!hasGroqConfig) {
        setError('Groq API Key ontbreekt. Voeg VITE_GROQ_API_KEY toe aan je omgevingsvariabelen.');
        return;
      }

      if (inventory.length === 0 && suppliers.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        // We maken een korte samenvatting van de data voor de AI
        const lowStockItems = inventory.filter(i => (i.stock_level || 0) < (i.reorder_point || 0));
        const topSuppliers = suppliers.sort((a, b) => (b.reliability_score || 0) - (a.reliability_score || 0)).slice(0, 3);
        const pendingOrders = orders.find(o => o.stage === 'Pending')?.count || 0;

        let response;
        let retries = 3;
        let delay = 1000;

        // Beetje robuustheid: we proberen het een paar keer als het misgaat
        while (retries > 0) {
          try {
            response = await generateGroqCompletion([
              {
                role: "system",
                content: "Je bent een AI operations consultant. Je geeft data-gedreven, high-impact executive inzichten. Gebruik dikgedrukte tekst voor belangrijke getallen en statistieken. Wees direct en actiegericht. De output moet in het Nederlands zijn."
              },
              {
                role: "user",
                content: `Je bent een AI operations consultant.

Analyseer deze real-time supply chain snapshot en genereer precies 3 high-impact, executive-level inzichten.

Focus strikt op:
- Voorraadtekort risico's (urgentie + getroffen producten)
- Financiële impact (kosten, omzetrisico, besparingsmogelijkheden)
- Leveranciersprestaties (betrouwbaarheid vs efficiëntie afwegingen)

Data:
- Lage Voorraad: ${lowStockItems.length} items (${lowStockItems.map(i => i.name).join(', ')})
- Openstaande Bestellingen: ${pendingOrders}
- Top Leveranciers: ${topSuppliers.map(s => `${s.name} (${(s.reliability_score * 100).toFixed(0)}% betrouwbaarheid)`).join(', ')}

Instructies:
- Elk inzicht moet actiegericht zijn (inclusief een aanbeveling)
- Wees specifiek en data-gedreven (geen algemene uitspraken)
- Highlight risico's, inefficiënties of kansen
- Denk als een McKinsey consultant

Formaat regels:
- Gebruik iconen: ⚠️ (risico), 💸 (financieel), 🤖 (AI inzicht), 📦 (operaties)
- Gebruik **dikgedrukt** voor alle getallen en belangrijke termen.
- Maximaal 10 zinnen.
- Geen overbodige tekst, geen uitleg, alleen inzichten
- Output in het Nederlands`
              }
            ]);
            break; // Gelukt!
          } catch (err: any) {
            retries--;
            const isAuthError = err.message?.toLowerCase().includes('api key') || err.message?.includes('401');
            
            if (retries === 0 || isAuthError) {
              throw err; // Geef het op
            }
            
            console.warn(`Groq API fout, opnieuw proberen in ${delay}ms... (${retries} pogingen over)`, err);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Wacht steeds iets langer
          }
        }

        const generatedText = response?.choices?.[0]?.message?.content || '';
        setInsights(generatedText.trim());
      } catch (err: any) {
        console.error('Fout bij genereren inzichten:', err);
        
        let errorMessage = err.message || 'Kon geen inzichten genereren met Groq AI.';
        
        if (errorMessage.toLowerCase().includes('api key') || errorMessage.includes('401')) {
          errorMessage = 'Je Groq API key is ongeldig of ontbreekt. Controleer je VITE_GROQ_API_KEY variabele.';
        } else if (errorMessage.includes('429')) {
          errorMessage = 'Rate limit bereikt. Probeer het over een momentje opnieuw.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    generateInsights();
  }, [inventory, suppliers, orders, retryTrigger]);

  return (
    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
          <img src="/betsy-logo.png" alt="Betsy AI" className="w-5 h-5 object-contain" onError={(e) => {
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
          <BrainCircuit className="hidden w-4 h-4 text-indigo-400" />
        </div>
        <h3 className="text-white font-semibold flex items-center gap-2">
          Betsy AI Inzichten
          <Sparkles className="w-4 h-4 text-amber-400" />
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-indigo-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Supply chain data analyseren met Llama 3.3 70B...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-rose-400 gap-3 text-center">
            <AlertCircle className="w-6 h-6" />
            <span className="text-sm">{error}</span>
            <button 
              onClick={() => setRetryTrigger(prev => prev + 1)}
              className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors"
            >
              Opnieuw proberen
            </button>
          </div>
        ) : insights ? (
          <div className="text-gray-300 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{insights}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Wachten op gegevens om inzichten te genereren...
          </div>
        )}
      </div>
    </div>
  );
}
