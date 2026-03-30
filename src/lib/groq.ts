// Groq API client – retry-logica zit hier zodat componenten er niet mee hoeven te dealen.

const groqApiKey = import.meta.env.VITE_GROQ_API_KEY ?? '';
export const hasGroqConfig = Boolean(groqApiKey);

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: { message: { content: string } }[];
}

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Stuurt een chat completion request naar de Groq API.
 * Probeert automatisch opnieuw bij tijdelijke fouten (429, 5xx).
 *
 * @param messages  Berichten voor de chat
 * @param model     Groq-modelnaam (default: llama-3.3-70b-versatile)
 * @param maxRetries Maximaal aantal pogingen bij tijdelijke fouten
 */
export async function generateGroqCompletion(
  messages: GroqMessage[],
  model = 'llama-3.3-70b-versatile',
  maxRetries = 3,
): Promise<GroqResponse> {
  if (!hasGroqConfig) {
    throw new Error('VITE_GROQ_API_KEY ontbreekt in de omgevingsvariabelen.');
  }

  let attempt = 0;
  let delay = 1_000;

  while (attempt < maxRetries) {
    attempt++;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    // Succesvol
    if (response.ok) {
      return response.json() as Promise<GroqResponse>;
    }

    const errorBody = await response.json().catch(() => ({})) as { error?: { message?: string } };
    const message = errorBody?.error?.message ?? `HTTP ${response.status}`;

    // Fouten die we NIET opnieuw proberen
    if (response.status === 401) {
      throw new Error(`Ongeldige Groq API key. Controleer VITE_GROQ_API_KEY. (${message})`);
    }
    if (response.status === 400) {
      throw new Error(`Ongeldig verzoek naar Groq: ${message}`);
    }

    // Tijdelijke fouten – wacht en probeer opnieuw
    if (attempt < maxRetries) {
      console.warn(`Groq API fout (poging ${attempt}/${maxRetries}), opnieuw in ${delay}ms: ${message}`);
      await sleep(delay);
      delay *= 2;
    } else {
      throw new Error(
        response.status === 429
          ? `Rate limit bereikt. Probeer het over een momentje opnieuw. (${message})`
          : `Groq API fout na ${maxRetries} pogingen: ${message}`,
      );
    }
  }

  // TypeScript: deze regel wordt nooit bereikt
  throw new Error('Onverwachte situatie in generateGroqCompletion');
}
