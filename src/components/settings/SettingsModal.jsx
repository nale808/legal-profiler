import { useState } from 'react'
import useSettingsStore from '../../store/useSettingsStore'
import { PROVIDERS, PROVIDER_LIST } from '../../data/providers'

export default function SettingsModal({ onClose }) {
  const {
    provider, apiKeys, models, customEndpoint,
    setProvider, setApiKey, setModel, setCustomEndpoint,
  } = useSettingsStore()

  const [showKeys, setShowKeys] = useState({})
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const activeProvider = PROVIDERS[provider]
  const isConfigured = !!(provider === 'custom' ? customEndpoint : apiKeys[provider])

  const toggleShow = (key) => setShowKeys(prev => ({ ...prev, [key]: !prev[key] }))

  async function testConnection() {
    setTesting(true)
    setTestResult(null)
    try {
      if (provider === 'anthropic') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKeys.anthropic,
            'content-type': 'application/json',
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: models.anthropic,
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hi' }],
          }),
        })
        setTestResult(res.ok ? 'success' : `Error ${res.status}`)
      } else if (provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKeys.openai}` },
        })
        setTestResult(res.ok ? 'success' : `Error ${res.status}`)
      } else {
        setTestResult('Custom endpoint testing not supported')
      }
    } catch (e) {
      setTestResult(`Failed: ${e.message}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-navy">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* API key warning */}
          {!isConfigured && (
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Add an API key below to start researching attorneys.
            </div>
          )}

          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">AI Provider</label>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDER_LIST.map(p => (
                <button
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
                    provider === p.id
                      ? 'bg-navy text-white border-navy'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-navy/40'
                  }`}
                >
                  {p.id === 'anthropic' ? 'Anthropic' : p.id === 'openai' ? 'OpenAI' : 'Custom'}
                </button>
              ))}
            </div>
          </div>

          {/* Provider Config */}
          {provider !== 'custom' && (
            <>
              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {activeProvider.name} API Key
                </label>
                <div className="relative">
                  <input
                    type={showKeys[provider] ? 'text' : 'password'}
                    value={apiKeys[provider] || ''}
                    onChange={e => setApiKey(provider, e.target.value)}
                    placeholder={activeProvider.keyPlaceholder}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow(provider)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKeys[provider] ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">{activeProvider.keyHint}</p>
              </div>

              {/* Model Selection */}
              {activeProvider.models.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <select
                    value={models[provider] || activeProvider.defaultModel}
                    onChange={e => setModel(provider, e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent bg-white"
                  >
                    {activeProvider.models.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Custom endpoint config */}
          {provider === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Endpoint URL</label>
                <input
                  type="text"
                  value={customEndpoint}
                  onChange={e => setCustomEndpoint(e.target.value)}
                  placeholder="http://localhost:11434/v1/chat/completions"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">OpenAI-compatible endpoint (Ollama, LM Studio, etc.)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key (if required)</label>
                <input
                  type="password"
                  value={apiKeys.custom || ''}
                  onChange={e => setApiKey('custom', e.target.value)}
                  placeholder="Optional"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                />
              </div>
            </>
          )}

          {/* Serper key — shown for custom or as optional for any provider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Serper.dev API Key
              {provider !== 'custom' && <span className="text-gray-400 font-normal ml-1">(optional fallback)</span>}
              {provider === 'custom' && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <input
                type={showKeys.serper ? 'text' : 'password'}
                value={apiKeys.serper || ''}
                onChange={e => setApiKey('serper', e.target.value)}
                placeholder="serper.dev API key"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => toggleShow('serper')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Required for custom models. Get a free key at serper.dev</p>
          </div>

          {/* Test connection */}
          {provider !== 'custom' && (
            <div>
              <button
                onClick={testConnection}
                disabled={testing || !apiKeys[provider]}
                className="flex items-center gap-2 text-sm bg-sage-50 text-sage-dark hover:bg-sage-100 border border-sage-100 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? (
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                )}
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              {testResult && (
                <p className={`text-xs mt-2 ${testResult === 'success' ? 'text-sage-dark' : 'text-red-500'}`}>
                  {testResult === 'success' ? '✓ Connection successful' : testResult}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-navy text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-navy-dark transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
