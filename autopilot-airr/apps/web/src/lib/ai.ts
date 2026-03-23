import Anthropic from '@anthropic-ai/sdk';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'autopilot.db');

function getDb() {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  return db;
}

export interface AIConfig {
  provider: string;
  model: string;
  apiKey: string;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
}

export async function getActiveProvider(): Promise<AIConfig | null> {
  try {
    const db = getDb();
    const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'provider_%' OR key = 'active_provider'").all() as any[];
    db.close();

    const settings: Record<string, string> = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });

    const activeProvider = settings['active_provider'] || 'anthropic';
    
    return {
      provider: activeProvider,
      model: settings[`${activeProvider}_model`] || getDefaultModel(activeProvider),
      apiKey: settings[`${activeProvider}_apikey`] || '',
    };
  } catch {
    return null;
  }
}

export function getDefaultModel(provider: string): string {
  const defaults: Record<string, string> = {
    anthropic: 'claude-sonnet-4-20250514',
    openai: 'gpt-4o-mini',
    openrouter: 'anthropic/claude-3-haiku',
    google: 'gemini-1.5-flash',
    groq: 'llama-3.1-8b-instant',
    mistral: 'mistral-small-latest',
    azure: 'gpt-4o-mini',
  };
  return defaults[provider] || 'claude-sonnet-4-20250514';
}

export async function ai(prompt: string, maxTokens: number = 1000): Promise<AIResponse> {
  const config = await getActiveProvider();

  if (!config?.apiKey) {
    throw new Error('No API key configured. Please add your API key in Admin > API Keys.');
  }

  switch (config.provider) {
    case 'anthropic':
      return callAnthropic(config, prompt, maxTokens);
    case 'openai':
      return callOpenAI(config, prompt, maxTokens);
    case 'openrouter':
      return callOpenRouter(config, prompt, maxTokens);
    case 'google':
      return callGoogle(config, prompt, maxTokens);
    case 'groq':
      return callGroq(config, prompt, maxTokens);
    case 'mistral':
      return callMistral(config, prompt, maxTokens);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

async function callAnthropic(config: AIConfig, prompt: string, maxTokens: number): Promise<AIResponse> {
  const anthropic = new Anthropic({ apiKey: config.apiKey });
  
  const message = await anthropic.messages.create({
    model: config.model,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  return {
    content: message.content.map(block => block.type === 'text' ? block.text : '').join(''),
    provider: 'anthropic',
    model: config.model,
  };
}

async function callOpenAI(config: AIConfig, prompt: string, maxTokens: number): Promise<AIResponse> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await res.json();
  return {
    content: data.choices[0]?.message?.content || '',
    provider: 'openai',
    model: config.model,
  };
}

async function callOpenRouter(config: AIConfig, prompt: string, maxTokens: number): Promise<AIResponse> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AUTOPILOT',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || 'OpenRouter API error');
  }

  const data = await res.json();
  return {
    content: data.choices[0]?.message?.content || '',
    provider: 'openrouter',
    model: config.model,
  };
}

async function callGoogle(config: AIConfig, prompt: string, maxTokens: number): Promise<AIResponse> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens },
      }),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || 'Google AI API error');
  }

  const data = await res.json();
  return {
    content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    provider: 'google',
    model: config.model,
  };
}

async function callGroq(config: AIConfig, prompt: string, maxTokens: number): Promise<AIResponse> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || 'Groq API error');
  }

  const data = await res.json();
  return {
    content: data.choices[0]?.message?.content || '',
    provider: 'groq',
    model: config.model,
  };
}

async function callMistral(config: AIConfig, prompt: string, maxTokens: number): Promise<AIResponse> {
  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || 'Mistral AI API error');
  }

  const data = await res.json();
  return {
    content: data.choices[0]?.message?.content || '',
    provider: 'mistral',
    model: config.model,
  };
}
