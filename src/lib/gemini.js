const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const COFFEE_SYSTEM_PROMPT = `You are BrewIQ, a friendly and knowledgeable AI coffee assistant for a premium coffee chain called BrewIQ. You help customers with:

- Coffee brewing methods (pour-over, French press, espresso, cold brew, etc.)
- Bean origins and flavor profiles (Ethiopian Yirgacheffe, Colombian, Brazilian, etc.)
- Menu recommendations based on preferences
- Coffee fun facts and history
- Food pairing suggestions
- Caffeine information and health aspects of coffee

Personality: Warm, enthusiastic about coffee, concise but informative. Use coffee-related emojis occasionally (☕🫘✨). Keep responses under 200 words unless the user asks for detail. If asked about non-coffee topics, gently steer back to coffee while being helpful.

Our menu includes: Espresso, Cappuccino, Latte, Americano, Flat White, Iced Latte, Cold Brew, Frappuccino, Iced Mocha, Matcha Latte, Earl Grey, Croissant, Chocolate Muffin, Avocado Toast.`;

async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);
    if (response.status === 429) {
      // Rate limited — wait and retry
      const waitMs = Math.pow(2, i) * 1000 + Math.random() * 1000;
      console.warn(`Gemini rate limited, retrying in ${Math.round(waitMs)}ms...`);
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }
    return response;
  }
  throw new Error('Gemini API rate limited after retries. Please wait a moment and try again.');
}

export async function sendToGemini(messages) {
  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const response = await fetchWithRetry(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: COFFEE_SYSTEM_PROMPT }]
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    })
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error('Gemini error:', response.status, text);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Failed to parse Gemini response');
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t process that. Try again!';
}
