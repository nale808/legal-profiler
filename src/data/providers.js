export const PROVIDERS = {
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    hasNativeWebSearch: true,
    apiUrl: 'https://api.anthropic.com/v1/messages',
    models: [
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6 (Recommended)' },
      { id: 'claude-opus-4-6', name: 'Claude Opus 4.6 (Most Thorough)' },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5 (Fastest)' },
    ],
    defaultModel: 'claude-sonnet-4-6',
    keyPlaceholder: 'sk-ant-...',
    keyHint: 'Get your key at console.anthropic.com',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    hasNativeWebSearch: true,
    apiUrl: 'https://api.openai.com/v1/responses',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o (Recommended)' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Faster/Cheaper)' },
    ],
    defaultModel: 'gpt-4o',
    keyPlaceholder: 'sk-...',
    keyHint: 'Get your key at platform.openai.com',
  },
  custom: {
    id: 'custom',
    name: 'Custom / Local Model',
    hasNativeWebSearch: false,
    apiUrl: '',
    models: [],
    defaultModel: '',
    keyPlaceholder: 'API key (if required)',
    keyHint: 'Requires a Serper.dev key for web search',
    requiresSerper: true,
  },
}

export const PROVIDER_LIST = Object.values(PROVIDERS)
