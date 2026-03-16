import { useState, useEffect } from 'react';
import { BrainCircuit, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { hf, hasHfConfig } from '../lib/mistral';

interface AIInsightsProps {
  inventory: any[];
  suppliers: any[];
  orders: any[];
}

export function AIInsights({ inventory, suppliers, orders }: AIInsightsProps) {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function generateInsights() {
      if (!hasHfConfig) {
        setError('Hugging Face Token is missing. Please add VITE_HF_TOKEN to your environment variables.');
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

        const prompt = `
<s>[INST] You are an expert procurement and supply chain AI assistant named Betsy. 
Analyze the following supply chain data and provide 3 concise, actionable insights or recommendations.

Data Summary:
- Total Inventory Items: ${inventory.length}
- Low Stock Items: ${lowStockItems.length} (${lowStockItems.map(i => i.name).join(', ')})
- Top 3 Reliable Suppliers: ${topSuppliers.map(s => s.name).join(', ')}
- Pending Orders: ${pendingOrders}

Provide your insights in a clear, bulleted list. Do not include any introductory or concluding remarks. [/INST]
`;

        const response = await hf.textGeneration({
          model: 'mistralai/Mistral-7B-Instruct-v0.3',
          inputs: prompt,
          parameters: {
            max_new_tokens: 250,
            temperature: 0.3,
            return_full_text: false,
          }
        });

        setInsights(response.generated_text.trim());
      } catch (err: any) {
        console.error('Error generating insights:', err);
        setError(err.message || 'Failed to generate insights from Mistral AI.');
      } finally {
        setLoading(false);
      }
    }

    generateInsights();
  }, [inventory, suppliers, orders]);

  return (
    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
          <BrainCircuit className="w-4 h-4 text-indigo-400" />
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
            <span className="text-sm">Analyzing supply chain data with Mistral-7B...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-rose-400 gap-3 text-center">
            <AlertCircle className="w-6 h-6" />
            <span className="text-sm">{error}</span>
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
