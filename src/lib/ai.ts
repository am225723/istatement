import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
    'X-Title': 'ConRes'
  }
});

function normalizeAIError(error: any) {
  const status = error?.status || error?.code || error?.response?.status;
  const message = String(error?.message || 'AI request failed');

  if (status === 429 || message.includes('429') || message.toLowerCase().includes('rate limit')) {
    return 'The AI model is temporarily busy or rate-limited. Please wait a moment and try again, or switch OPENROUTER_MODEL to another available model in Vercel.';
  }

  if (status === 401 || message.includes('401')) {
    return 'The AI key is not authorized. Please check OPENROUTER_API_KEY in Vercel Environment Variables.';
  }

  if (status === 402 || message.includes('402')) {
    return 'The AI provider says this account needs credits or billing enabled for the selected model.';
  }

  if (status === 404 || message.includes('404')) {
    return 'The selected AI model was not found. Please check OPENROUTER_MODEL in Vercel Environment Variables.';
  }

  return message;
}

export async function askAI(message: string, systemPrompt = 'You are the AI assistant for ConRes. Be helpful, compassionate, concise, and practical.') {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is missing. Add it in .env.local and Vercel Environment Variables.');
  }

  try {
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
  } catch (error: any) {
    throw new Error(normalizeAIError(error));
  }
}
