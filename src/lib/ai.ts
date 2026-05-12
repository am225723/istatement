import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
    'X-Title': 'ConRes'
  }
});

export async function askAI(message: string, systemPrompt = 'You are the AI assistant for ConRes. Be helpful, compassionate, concise, and practical.') {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is missing. Add it in .env.local and Vercel Environment Variables.');
  }

  const completion = await client.chat.completions.create({
    model: process.env.OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    temperature: 0.7,
    max_tokens: 900
  });

  return completion.choices[0]?.message?.content || '';
}
