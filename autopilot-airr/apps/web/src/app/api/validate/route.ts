import { NextResponse } from 'next/server';

const PROVIDERS = {
  anthropic: {
    name: 'Anthropic',
    logo: '🤖',
    endpoint: 'https://api.anthropic.com/v1/messages',
    models: ['claude-sonnet-4-20250514', 'claude-opus-4-20250514', 'claude-haiku-3-20250514'],
    validate: async (apiKey: string) => {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-3-20250514',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }],
        }),
      });
      return res.ok;
    },
  },
  openai: {
    name: 'OpenAI',
    logo: '✨',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    validate: async (apiKey: string) => {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return res.ok;
    },
  },
  openrouter: {
    name: 'OpenRouter',
    logo: '🔮',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    models: ['anthropic/claude-3-haiku', 'anthropic/claude-3-sonnet', 'openai/gpt-4o', 'google/gemini-pro-1.5'],
    validate: async (apiKey: string) => {
      const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (res.ok) return true;
      const data = await res.json().catch(() => ({}));
      if (data.error?.code === 'invalid_api_key') return false;
      return res.status === 401;
    },
  },
  google: {
    name: 'Google AI',
    logo: '🌿',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
    validate: async (apiKey: string) => {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      return res.ok;
    },
  },
  groq: {
    name: 'Groq',
    logo: '⚡',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    validate: async (apiKey: string) => {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return res.ok;
    },
  },
  mistral: {
    name: 'Mistral AI',
    logo: '🌊',
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    models: ['mistral-large-latest', 'mistral-small-latest', 'codestral-latest'],
    validate: async (apiKey: string) => {
      const res = await fetch('https://api.mistral.ai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return res.ok;
    },
  },
  azure: {
    name: 'Azure OpenAI',
    logo: '☁️',
    endpoint: '', // Requires endpoint configuration
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    validate: async (apiKey: string) => {
      return apiKey.length > 0; // Azure keys need endpoint config
    },
  },
};

export async function POST(request: Request) {
  try {
    const { provider, apiKey } = await request.json();

    if (!provider || !apiKey) {
      return NextResponse.json({ valid: false, error: 'Provider and API key are required' }, { status: 400 });
    }

    const providerConfig = PROVIDERS[provider as keyof typeof PROVIDERS];
    if (!providerConfig) {
      return NextResponse.json({ valid: false, error: 'Unknown provider' }, { status: 400 });
    }

    // Validate API key format
    if (provider === 'anthropic' && !apiKey.startsWith('sk-ant-')) {
      return NextResponse.json({ valid: false, error: 'Invalid Anthropic API key format (should start with sk-ant-)' });
    }

    if (provider === 'openai' && !apiKey.startsWith('sk-')) {
      return NextResponse.json({ valid: false, error: 'Invalid OpenAI API key format (should start with sk-)' });
    }

    if (provider === 'google' && apiKey.length < 30) {
      return NextResponse.json({ valid: false, error: 'Invalid Google API key format' });
    }

    try {
      const valid = await providerConfig.validate(apiKey);
      return NextResponse.json({ valid, error: valid ? null : 'API key validation failed' });
    } catch (error: any) {
      return NextResponse.json({ valid: false, error: error.message || 'Validation request failed' });
    }
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ providers: PROVIDERS });
}
