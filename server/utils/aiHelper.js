const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const callAI = async (messages, systemPrompt = '', maxTokens = 2000) => {
  const useOpenRouter = !!process.env.OPENROUTER_API_KEY;
  const apiKey = useOpenRouter ? process.env.OPENROUTER_API_KEY : process.env.GROQ_API_KEY;
  const url = useOpenRouter ? OPENROUTER_API_URL : GROQ_API_URL;
  const model = useOpenRouter ? 'google/gemma-4-31b-it:free' : 'llama-3.3-70b-versatile';

  const allMessages = [];
  if (systemPrompt) allMessages.push({ role: 'system', content: systemPrompt });
  messages.forEach(m => allMessages.push({ role: m.role, content: m.content }));

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };
  if (useOpenRouter) {
    headers['HTTP-Referer'] = 'http://localhost:3000';
    headers['X-Title'] = 'AI Resume Analyzer';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model, messages: allMessages, max_tokens: maxTokens, temperature: 0.7 }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'AI API request failed');
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

const parseAIJson = (text) => {
  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch {
    throw new Error('Failed to parse AI response as JSON');
  }
};

module.exports = { callAI, parseAIJson };
