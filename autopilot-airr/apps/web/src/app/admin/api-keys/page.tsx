'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

const PROVIDERS = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    logo: '🤖',
    description: 'Claude models - best for reasoning and analysis',
    models: ['claude-sonnet-4-20250514', 'claude-opus-4-20250514', 'claude-haiku-3-20250514'],
    keyFormat: 'sk-ant-...',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    logo: '✨',
    description: 'GPT-4 models - fast and versatile',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    keyFormat: 'sk-...',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    logo: '🔮',
    description: 'Access 100+ models from various providers',
    models: ['anthropic/claude-3-haiku', 'anthropic/claude-3-sonnet', 'openai/gpt-4o', 'google/gemini-pro-1.5', 'meta-llama/llama-3-70b'],
    keyFormat: 'sk-or-...',
  },
  {
    id: 'google',
    name: 'Google AI',
    logo: '🌿',
    description: 'Gemini models - multimodal and fast',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
    keyFormat: 'AIza...',
  },
  {
    id: 'groq',
    name: 'Groq',
    logo: '⚡',
    description: 'Ultra-fast inference with Llama and Mixtral',
    models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    keyFormat: 'gsk_...',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    logo: '🌊',
    description: 'French AI - excellent for code and reasoning',
    models: ['mistral-large-latest', 'mistral-small-latest', 'codestral-latest'],
    keyFormat: '...',
  },
];

interface ProviderState {
  enabled: boolean;
  apiKey: string;
  model: string;
  validated: boolean;
  validating: boolean;
  error: string;
}

export default function ApiKeysPage() {
  const [providers, setProviders] = useState<Record<string, ProviderState>>({});
  const [activeProvider, setActiveProvider] = useState<string>('anthropic');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      
      const state: Record<string, ProviderState> = {};
      PROVIDERS.forEach(p => {
        state[p.id] = {
          enabled: data.api?.[`${p.id}_enabled`] === 'true',
          apiKey: data.api?.[`${p.id}_apikey`] || '',
          model: data.api?.[`${p.id}_model`] || p.models[0],
          validated: !!data.api?.[`${p.id}_apikey`],
          validating: false,
          error: '',
        };
      });
      
      setProviders(state);
      setActiveProvider(data.api?.active_provider || 'anthropic');
    } catch (e) {
      console.error('Failed to load providers');
    }
  };

  const toggleProvider = (id: string) => {
    setProviders(prev => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id].enabled },
    }));
  };

  const updateApiKey = (id: string, value: string) => {
    setProviders(prev => ({
      ...prev,
      [id]: { ...prev[id], apiKey: value, validated: false, error: '' },
    }));
  };

  const updateModel = (id: string, value: string) => {
    setProviders(prev => ({
      ...prev,
      [id]: { ...prev[id], model: value },
    }));
  };

  const validateProvider = async (id: string) => {
    const provider = providers[id];
    if (!provider?.apiKey) return;

    setProviders(prev => ({
      ...prev,
      [id]: { ...prev[id], validating: true, error: '' },
    }));

    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: id, apiKey: provider.apiKey }),
      });
      const data = await res.json();

      setProviders(prev => ({
        ...prev,
        [id]: { 
          ...prev[id], 
          validating: false, 
          validated: data.valid,
          error: data.error || '',
        },
      }));

      if (data.valid) {
        showMessage('success', `${PROVIDERS.find(p => p.id === id)?.name} API key validated successfully`);
      }
    } catch (e: any) {
      setProviders(prev => ({
        ...prev,
        [id]: { ...prev[id], validating: false, error: e.message },
      }));
    }
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const apiData: Record<string, string> = { active_provider: activeProvider };
      
      Object.entries(providers).forEach(([id, state]) => {
        apiData[`${id}_enabled`] = String(state.enabled);
        apiData[`${id}_apikey`] = state.apiKey;
        apiData[`${id}_model`] = state.model;
      });

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'api', data: apiData }),
      });

      if (res.ok) {
        showMessage('success', 'API configuration saved successfully');
      } else {
        showMessage('error', 'Failed to save API configuration');
      }
    } catch (e) {
      showMessage('error', 'Failed to save API configuration');
    }
    setSaving(false);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <>
      <Navigation />
      <div className="wrap">
        <div className="settings-card">
          <div className="settings-card-title">
            🔑 API Keys Configuration
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>
            Configure your AI provider API keys. Multiple providers are supported - select one as the active provider.
          </p>

          <div className="provider-grid">
            {PROVIDERS.map(provider => (
              <div 
                key={provider.id} 
                className={`provider-card ${providers[provider.id]?.enabled ? 'active' : ''}`}
              >
                <div className="provider-header">
                  <div className="provider-info">
                    <div className="provider-logo">{provider.logo}</div>
                    <div>
                      <div className="provider-name">{provider.name}</div>
                      <div className="provider-desc">{provider.description}</div>
                    </div>
                  </div>
                  <button 
                    className={`provider-toggle ${providers[provider.id]?.enabled ? 'active' : ''}`}
                    onClick={() => toggleProvider(provider.id)}
                    aria-label={`Toggle ${provider.name}`}
                  />
                </div>

                {providers[provider.id]?.enabled && (
                  <>
                    <div className="api-key-input">
                      <input
                        type={showKeys[provider.id] ? 'text' : 'password'}
                        className="form-input"
                        placeholder={`Enter ${provider.name} API key (${provider.keyFormat})`}
                        value={providers[provider.id]?.apiKey || ''}
                        onChange={e => updateApiKey(provider.id, e.target.value)}
                      />
                      <button 
                        className="toggle-visibility"
                        onClick={() => setShowKeys(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                      >
                        {showKeys[provider.id] ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>

                    {providers[provider.id]?.error && (
                      <div className="validation-status invalid">
                        ⚠️ {providers[provider.id].error}
                      </div>
                    )}

                    {providers[provider.id]?.validated && (
                      <div className="validation-status valid">
                        ✓ API key validated
                      </div>
                    )}

                    <div style={{ marginTop: 12 }}>
                      <label className="form-label" style={{ fontSize: 10, marginBottom: 6 }}>Model</label>
                      <div className="custom-select">
                        <select 
                          className="form-input"
                          value={providers[provider.id]?.model || provider.models[0]}
                          onChange={e => updateModel(provider.id, e.target.value)}
                          style={{ display: 'none' }}
                        >
                          {provider.models.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <div 
                          className="select-trigger"
                          onClick={() => {
                            const dropdown = document.getElementById(`dropdown-${provider.id}`);
                            if (dropdown) {
                              dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                            }
                          }}
                        >
                          {providers[provider.id]?.model || provider.models[0]}
                          <span style={{ marginLeft: 'auto' }}>▼</span>
                        </div>
                        <div 
                          id={`dropdown-${provider.id}`}
                          className="select-dropdown"
                          style={{ display: 'none', maxHeight: 150, overflowY: 'auto' }}
                        >
                          {provider.models.map(m => (
                            <div 
                              key={m}
                              className={`select-option ${(providers[provider.id]?.model || provider.models[0]) === m ? 'selected' : ''}`}
                              onClick={() => {
                                updateModel(provider.id, m);
                                document.getElementById(`dropdown-${provider.id}`).style.display = 'none';
                              }}
                            >
                              {m}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button 
                      className="test-btn"
                      onClick={() => validateProvider(provider.id)}
                      disabled={!providers[provider.id]?.apiKey || providers[provider.id]?.validating}
                    >
                      {providers[provider.id]?.validating ? '⏳ Testing...' : '✓ Test Connection'}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="save-section">
            <div>
              <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Active Provider</label>
              <select 
                className="form-input"
                style={{ width: 200 }}
                value={activeProvider}
                onChange={e => setActiveProvider(e.target.value)}
              >
                {PROVIDERS.filter(p => providers[p.id]?.enabled && providers[p.id]?.validated).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <button className="save-btn" onClick={saveAll} disabled={saving}>
              {saving ? '💾 Saving...' : '💾 Save Configuration'}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={message.type === 'success' ? 'success-toast' : 'error-toast'}>
          {message.type === 'success' ? '✓' : '✗'} {message.text}
        </div>
      )}
    </>
  );
}
