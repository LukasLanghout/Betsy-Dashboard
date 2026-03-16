export const groqApiKey = import.meta.env.VITE_GROQ_API_KEY || '';
export const hasGroqConfig = Boolean(groqApiKey);

export async function generateGroqCompletion(messages: any[], model: string = 'llama-3.3-70b-versatile') {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 250
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch from Groq API');
  }

  return response.json();
}
