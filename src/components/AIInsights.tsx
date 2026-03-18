import { useState, useEffect } from 'react';
import { BrainCircuit, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { generateGroqCompletion, hasGroqConfig } from '../lib/groq';

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
        setError('Groq API Key is missing. Please add VITE_GROQ_API_KEY to your environment variables.');
        return;
      }

      if (inventory.length === 0 && suppliers.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        // Prepare a concise summary of the data for the prompt
        const lowStockItems = inventory.filter(i => (i.stock_level || 0) < (i.reorder_point || 0));
        const topSuppliers = suppliers.sort((a, b) => (b.reliability_score || 0) - (a.reliability_score || 0)).slice(0, 3);
        const pendingOrders = orders.find(o => o.stage === 'Pending')?.count || 0;

        let response;
        let retries = 3;
        let delay = 1000;

        while (retries > 0) {
          try {
            response = await generateGroqCompletion([
              {
                role: "system",
                content: "You are an expert procurement and supply chain AI assistant named Betsy."
              },
              {
                role: "user",
                content: `Analyze the following supply chain data and provide 3 concise, actionable insights or recommendations.

Data Summary:
- Total Inventory Items: ${inventory.length}
- Low Stock Items: ${lowStockItems.length} (${lowStockItems.map(i => i.name).join(', ')})
- Top 3 Reliable Suppliers: ${topSuppliers.map(s => s.name).join(', ')}
- Pending Orders: ${pendingOrders}

Provide your insights in a clear, bulleted list. Do not include any introductory or concluding remarks.`
              }
            ]);
            break; // Success, exit retry loop
          } catch (err: any) {
            retries--;
            const isAuthError = err.message?.toLowerCase().includes('api key') || err.message?.includes('401');
            
            if (retries === 0 || isAuthError) {
              throw err; // Throw if out of retries or it's a hard auth error
            }
            
            console.warn(`Groq API error, retrying in ${delay}ms... (${retries} retries left)`, err);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
          }
        }

        const generatedText = response?.choices?.[0]?.message?.content || '';
        setInsights(generatedText.trim());
      } catch (err: any) {
        console.error('Error generating insights:', err);
        
        let errorMessage = err.message || 'Failed to generate insights from Groq AI.';
        
        if (errorMessage.toLowerCase().includes('api key') || errorMessage.includes('401')) {
          errorMessage = 'Your Groq API key is invalid or missing. Please check your VITE_GROQ_API_KEY environment variable.';
        } else if (errorMessage.includes('429')) {
          errorMessage = 'Rate limit exceeded. Please try again in a moment.';
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
          Betsy AI Insights
          <Sparkles className="w-4 h-4 text-amber-400" />
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-indigo-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Analyzing supply chain data with Llama 3.3 70B...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-rose-400 gap-3 text-center">
            <AlertCircle className="w-6 h-6" />
            <span className="text-sm">{error}</span>
            <button 
              onClick={() => setRetryTrigger(prev => prev + 1)}
              className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        ) : insights ? (
          <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {insights}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Waiting for data to generate insights...
          </div>
        )}
      </div>
    </div>
  );
}
