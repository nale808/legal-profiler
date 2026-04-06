import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PROVIDERS } from '../data/providers'

const useSettingsStore = create(
  persist(
    (set, get) => ({
      provider: 'anthropic',
      apiKeys: {
        anthropic: '',
        openai: '',
        serper: '',
        custom: '',
      },
      models: {
        anthropic: PROVIDERS.anthropic.defaultModel,
        openai: PROVIDERS.openai.defaultModel,
        custom: '',
      },
      customEndpoint: '',

      setProvider: (provider) => set({ provider }),

      setApiKey: (provider, key) =>
        set(state => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
        })),

      setModel: (provider, model) =>
        set(state => ({
          models: { ...state.models, [provider]: model },
        })),

      setCustomEndpoint: (url) => set({ customEndpoint: url }),

      isConfigured: () => {
        const { provider, apiKeys, customEndpoint } = get()
        if (provider === 'custom') return !!customEndpoint
        return !!apiKeys[provider]
      },

      getActiveKey: () => {
        const { provider, apiKeys } = get()
        return apiKeys[provider] || ''
      },

      getActiveModel: () => {
        const { provider, models } = get()
        return models[provider] || ''
      },
    }),
    {
      name: 'ocp_settings_v1',
    }
  )
)

export default useSettingsStore
