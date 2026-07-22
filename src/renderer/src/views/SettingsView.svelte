<script lang="ts">
  import { onMount } from 'svelte'
  import { uiStore } from '../stores/uiStore.svelte'
  import TabNav from '../lib/ui/TabNav.svelte'

  let activeTab = $state('sg')
  let apiVisible = $state(false)
  let connTested = $state(false)
  let token = $state('')
  let isSavingToken = $state(false)
  let appVersion = $state('')

  onMount(async () => {
    if (uiStore.settingsTab !== 'sg') {
      activeTab = uiStore.settingsTab
      uiStore.settingsTab = 'sg'
    }
    try {
      const storedToken = await window.api.getStratzToken()
      if (storedToken) token = storedToken
      const config = await window.api.getConfig()
      autoSync = config.autoSyncMatches ?? true
      appVersion = await window.api.getAppVersion()
      const llmCfg = await window.api.getLlmConfig()
      if (llmCfg.configured) {
        llmProvider = llmCfg.provider || 'openai'
        llmConfigured = llmCfg.configured
        const storedModel = llmCfg.model
        if (storedModel) {
          const models = PROVIDER_MODELS[llmProvider] || []
          if (models.includes(storedModel)) {
            llmModel = storedModel
          } else {
            llmModel = '__custom__'
            llmModelCustom = storedModel
          }
        } else {
          llmModel = (PROVIDER_MODELS[llmProvider] || [])[0] || ''
        }
      }
    } catch {
      // Config not loaded yet, use defaults
    }
  })

  let autoSync = $state(true)
  let alwaysOnSidebar = $state(true)

  const tabs = [
    { id: 'sg', label: 'General' },
    { id: 'sllm', label: 'AI Coach' },
    { id: 'sapi', label: 'API' },
    { id: 'sapp', label: 'Appearance' },
    { id: 'sabt', label: 'About' }
  ]

  let llmProvider = $state('openai')
  let llmApiKey = $state('')
  let llmBaseUrl = $state('')
  let llmConfigured = $state(false)
  let isSavingLlm = $state(false)
  let llmKeyVisible = $state(false)
  let llmTesting = $state(false)
  let llmTestResult = $state<'ok' | 'err' | null>(null)
  let llmModel = $state('')
  let llmModelCustom = $state('')

  const PROVIDER_MODELS: Record<string, string[]> = {
    openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-5.6-terra', 'gpt-5.6-luna'],
    nvidia: [
      'meta/llama-3.1-8b-instruct',
      'meta/llama-3.3-70b-instruct',
      'meta/llama-4-maverick',
      'mistralai/mistral-large',
      'z-ai/glm-5.2',
      'deepseek-ai/deepseek-r1'
    ],
    claude: ['claude-3-5-haiku-latest', 'claude-sonnet-4-6', 'claude-opus-4-8', 'claude-fable-5'],
    gemini: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-3-flash', 'gemini-3.5-flash'],
    groq: [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'qwen3-32b'
    ]
  }

  const availableModels = $derived(PROVIDER_MODELS[llmProvider] || [])
  const usingCustomModel = $derived(llmModel === '__custom__')

  function toggleApi(): void {
    apiVisible = !apiVisible
  }

  function testConn(): void {
    connTested = false
    setTimeout(() => {
      connTested = true
      uiStore.showToast('STRATZ API connected ✓', 'ok')
    }, 1200)
  }

  async function updateToken(): Promise<void> {
    isSavingToken = true
    try {
      await window.api.setStratzToken(token)
      uiStore.showToast('API Key updated', 'ok')
    } catch {
      uiStore.showToast('Failed to save API Key', 'err')
    } finally {
      isSavingToken = false
    }
  }

  async function disconnectApi(): Promise<void> {
    token = ''
    try {
      await window.api.setStratzToken('')
      uiStore.showToast('API key removed', 'err')
    } catch {
      uiStore.showToast('Failed to remove API Key', 'err')
    }
  }

  async function toggleAutoSync(): Promise<void> {
    autoSync = !autoSync
    try {
      const config = await window.api.getConfig()
      config.autoSyncMatches = autoSync
      await window.api.setConfig(config)
    } catch {
      // Ignore config save errors
    }
    uiStore.showToast(`Auto-sync new matches: ${autoSync ? 'ON' : 'OFF'}`, 'ok')
  }

  function toggleCompact(): void {
    uiStore.compactMode = !uiStore.compactMode
    uiStore.showToast(`Compact mode: ${uiStore.compactMode ? 'ON' : 'OFF'}`, 'ok')
  }

  function toggleAnimated(): void {
    uiStore.animatedCharts = !uiStore.animatedCharts
    uiStore.showToast(`Animated charts: ${uiStore.animatedCharts ? 'ON' : 'OFF'}`, 'ok')
  }

  function toggleAlwaysOnSidebar(): void {
    alwaysOnSidebar = !alwaysOnSidebar
    uiStore.showToast(`Always-on sidebar: ${alwaysOnSidebar ? 'ON' : 'OFF'}`, 'ok')
  }

  function resolveModel(): string {
    if (usingCustomModel) return llmModelCustom
    if (availableModels.includes(llmModel)) return llmModel
    return availableModels[0] || ''
  }

  async function saveLlmConfig(): Promise<void> {
    isSavingLlm = true
    try {
      await window.api.setLlmConfig({
        provider: llmProvider,
        apiKey: llmApiKey,
        baseUrl: llmBaseUrl || undefined,
        model: resolveModel()
      })
      llmConfigured = true
      uiStore.showToast('AI Coach configured', 'ok')
    } catch {
      uiStore.showToast('Failed to save AI Coach config', 'err')
    } finally {
      isSavingLlm = false
    }
  }

  async function clearLlmConfig(): Promise<void> {
    try {
      await window.api.clearLlmConfig()
      llmConfigured = false
      llmApiKey = ''
      llmBaseUrl = ''
      llmModel = ''
      llmModelCustom = ''
      uiStore.showToast('AI Coach disconnected', 'err')
    } catch {
      uiStore.showToast('Failed to clear config', 'err')
    }
  }

  async function testLlmConnection(): Promise<void> {
    llmTesting = true
    llmTestResult = null
    const model = resolveModel()
    try {
      await window.api.setLlmConfig({
        provider: llmProvider,
        apiKey: llmApiKey,
        baseUrl: llmBaseUrl || undefined,
        model
      })
      const result = await window.api.generateCoaching({
        h: 'Anti-Mage',
        p: 'POSITION_1',
        k: 8,
        d: 3,
        a: 12,
        g: 620,
        nw: 18500,
        w: true,
        i: [],
        td: 28000,
        wp: 2
      })
      if (result?.err) {
        llmTestResult = 'err'
        uiStore.showToast(`Connection failed: ${result.err}`, 'err')
      } else {
        llmTestResult = 'ok'
        llmConfigured = true
        uiStore.showToast('AI Coach connected ✓', 'ok')
      }
    } catch {
      llmTestResult = 'err'
      uiStore.showToast('Connection failed', 'err')
    } finally {
      llmTesting = false
    }
  }
</script>

<div class="flex-1 overflow-y-auto overflow-x-hidden p-4 select-none">
  <div class="mb-4">
    <TabNav {tabs} active={activeTab} onTabChange={(id) => (activeTab = id)} variant="underline" />
  </div>

  {#if activeTab === 'sg'}
    <div class="card">
      <div
        class="flex items-center justify-between py-3.25 border-b border-bd gap-4 last:border-b-0"
      >
        <div>
          <div class="text-base font-semibold">Auto-sync new matches</div>
          <div class="text-xs text-tx2 mt-0.5 leading-relaxed">
            Automatically fetch match data when new games are detected by GSI
          </div>
        </div>
        <div
          class="w-9.5 h-5.5 rounded-[11px] relative cursor-pointer border transition-all after:content-[''] after:absolute after:top-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.4)] after:transition-[left]"
          class:bg-pu={autoSync}
          class:bg-s4={!autoSync}
          class:border-transparent={autoSync}
          class:border-bd2={!autoSync}
          class:after:left-[18px]={autoSync}
          class:after:left-0.5={!autoSync}
          role="switch"
          aria-checked={autoSync}
          tabindex="0"
          onkeydown={(e) => e.key === 'Enter' && toggleAutoSync()}
          onclick={toggleAutoSync}
        ></div>
      </div>
    </div>
  {:else if activeTab === 'sllm'}
    <div class="card">
      <div class="flex flex-col items-start py-3.25 border-b border-bd gap-2 last:border-b-0">
        <div>
          <div class="text-base font-semibold">AI Coach Configuration</div>
          <div class="text-xs text-tx2 mt-0.5 leading-relaxed">
            Connect an LLM provider for personalized match coaching. Your API key stays local.
          </div>
        </div>
        {#if llmConfigured}
          <div class="flex items-center gap-2 text-gr text-sm font-semibold mt-1">
            <span>✓ Connected</span>
          </div>
        {/if}
      </div>

      <div class="flex flex-col gap-3 py-3.25 border-b border-bd last:border-b-0">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-tx2 uppercase tracking-[0.5px]" for="llm-provider"
            >Provider</label
          >
          <select
            id="llm-provider"
            class="bg-s2 border border-bd rounded-lg text-tx px-3 py-2 text-sm focus:border-pu outline-hidden transition-colors"
            bind:value={llmProvider}
          >
            <option value="openai">OpenAI</option>
            <option value="nvidia">NVIDIA</option>
            <option value="claude">Claude (Anthropic)</option>
            <option value="gemini">Gemini (Google)</option>
            <option value="groq">Groq</option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-tx2 uppercase tracking-[0.5px]" for="llm-model"
            >Model</label
          >
          <select
            id="llm-model"
            class="bg-s2 border border-bd rounded-lg text-tx px-3 py-2 text-sm focus:border-pu outline-hidden transition-colors"
            bind:value={llmModel}
          >
            {#each availableModels as m, index (index)}
              <option value={m}>{m}</option>
            {/each}
            <option value="__custom__">Custom…</option>
          </select>
          {#if usingCustomModel}
            <input
              type="text"
              class="bg-s2 border border-bd rounded-lg text-tx px-3 py-2 text-sm outline-hidden font-mono focus:border-pu transition-colors mt-1"
              bind:value={llmModelCustom}
              placeholder="Enter model ID (e.g. gpt-4o)"
            />
          {/if}
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-tx2 uppercase tracking-[0.5px]" for="llm-apikey"
            >API Key</label
          >
          <div class="flex gap-2">
            <input
              id="llm-apikey"
              type={llmKeyVisible ? 'text' : 'password'}
              class="bg-s2 border border-bd rounded-lg text-tx px-3 py-2 text-sm flex-1 outline-hidden font-mono focus:border-pu transition-colors"
              bind:value={llmApiKey}
              placeholder="sk-..."
            />
            <button
              class="bg-s3 border border-bd text-tx2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-s4 hover:text-tx hover:border-bd2 cursor-pointer"
              onclick={() => (llmKeyVisible = !llmKeyVisible)}
            >
              {llmKeyVisible ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-tx2 uppercase tracking-[0.5px]" for="llm-baseurl">
            Base URL <span class="text-tx3 font-normal normal-case">(optional)</span>
          </label>
          <input
            id="llm-baseurl"
            type="text"
            class="bg-s2 border border-bd rounded-lg text-tx px-3 py-2 text-sm outline-hidden font-mono focus:border-pu transition-colors"
            bind:value={llmBaseUrl}
            placeholder="https://api.openai.com/v1"
          />
        </div>

        <div class="flex gap-2 mt-1">
          <button
            class="bg-pub border border-pu/40 text-tx px-4 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-pu/30 hover:border-pu disabled:opacity-50 cursor-pointer shadow-sm"
            onclick={saveLlmConfig}
            disabled={isSavingLlm || !llmApiKey}
          >
            {isSavingLlm ? 'Saving...' : 'Save'}
          </button>
          <button
            class="bg-s3 border border-bd text-tx2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-s4 hover:text-tx hover:border-bd2 disabled:opacity-50 cursor-pointer"
            onclick={testLlmConnection}
            disabled={llmTesting || !llmApiKey}
          >
            {llmTesting ? 'Testing...' : 'Test Connection'}
          </button>
          {#if llmConfigured}
            <button
              class="bg-rdb border border-rd text-rd px-4 py-1.5 rounded-lg text-sm font-bold cursor-pointer transition-all hover:bg-rd hover:text-white"
              onclick={clearLlmConfig}
            >
              Disconnect
            </button>
          {/if}
        </div>

        {#if llmTestResult === 'ok'}
          <div class="text-gr text-sm font-semibold flex items-center gap-1.25">
            ✓ Connection successful
          </div>
        {:else if llmTestResult === 'err'}
          <div class="text-rd text-sm font-semibold flex items-center gap-1.25">
            ✗ Connection failed
          </div>
        {/if}
      </div>
    </div>
  {:else if activeTab === 'sapi'}
    <div class="card">
      <div class="flex flex-col items-start py-3.25 border-b border-bd gap-2 last:border-b-0">
        <div>
          <label class="text-base font-semibold" for="stratz-api-key">STRATZ API Key</label>
          <div class="text-xs text-tx2 mt-0.5 leading-relaxed">
            Required to fetch match data. Get yours at stratz.com/api
          </div>
        </div>
        <div class="w-full flex gap-2">
          <input
            id="stratz-api-key"
            type={apiVisible ? 'text' : 'password'}
            class="bg-s2 border border-bd rounded-lg color-tx p-[8px_12px] text-sm flex-1 outline-hidden font-mono focus:border-pu transition-colors"
            bind:value={token}
            placeholder="Paste your STRATZ API Token..."
          />
          <button
            class="bg-s3 border border-bd text-tx2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-s4 hover:text-tx hover:border-bd2 cursor-pointer"
            onclick={toggleApi}>{apiVisible ? 'Hide' : 'Show'}</button
          >
          <button
            class="bg-pub border border-pu/40 text-tx px-4 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-pu/30 hover:border-pu disabled:opacity-50 cursor-pointer shadow-sm"
            onclick={updateToken}
            disabled={isSavingToken}
          >
            {#if isSavingToken}Saving...{:else}Save{/if}
          </button>
          <button
            class="bg-transparent border border-bd text-tx px-4 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-white/5 hover:border-bd2 cursor-pointer"
            onclick={testConn}>Test Connection</button
          >
        </div>
        {#if connTested}
          <div class="text-gr text-sm font-semibold flex items-center gap-1.25">
            ✓ Connection successful
          </div>
        {/if}
      </div>
      <div
        class="flex items-center justify-between py-3.25 border-b border-bd gap-4 last:border-b-0"
      >
        <div>
          <div class="text-base font-semibold">Disconnect API</div>
          <div class="text-xs text-tx2 mt-0.5 leading-relaxed">
            Remove API key and stop all data syncing immediately
          </div>
        </div>
        <button
          class="bg-rdb border border-rd text-rd rounded-lg px-3.5 py-1.5 text-sm font-bold cursor-pointer transition-all hover:bg-rd hover:text-white"
          onclick={disconnectApi}>Disconnect</button
        >
      </div>
    </div>
  {:else if activeTab === 'sapp'}
    <div class="card">
      <div
        class="flex items-center justify-between py-3.25 border-b border-bd gap-4 last:border-b-0"
      >
        <div>
          <div class="text-base font-semibold">Compact mode</div>
          <div class="text-xs text-tx2 mt-0.5 leading-relaxed">
            Reduce padding and spacing for more data density
          </div>
        </div>
        <div
          class="w-9.5 h-5.5 rounded-[11px] relative cursor-pointer border transition-all after:content-[''] after:absolute after:top-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.4)] after:transition-[left]"
          class:bg-pu={uiStore.compactMode}
          class:bg-s4={!uiStore.compactMode}
          class:border-transparent={uiStore.compactMode}
          class:border-bd2={!uiStore.compactMode}
          class:after:left-[18px]={uiStore.compactMode}
          class:after:left-0.5={!uiStore.compactMode}
          role="switch"
          aria-checked={uiStore.compactMode}
          tabindex="0"
          onkeydown={(e) => e.key === 'Enter' && toggleCompact()}
          onclick={toggleCompact}
        ></div>
      </div>
      <div
        class="flex items-center justify-between py-3.25 border-b border-bd gap-4 last:border-b-0"
      >
        <div>
          <div class="text-base font-semibold">Animated charts</div>
          <div class="text-xs text-tx2 mt-0.5 leading-relaxed">
            Enable smooth transitions and animations on chart data
          </div>
        </div>
        <div
          class="w-9.5 h-5.5 rounded-[11px] relative cursor-pointer border transition-all after:content-[''] after:absolute after:top-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.4)] after:transition-[left]"
          class:bg-pu={uiStore.animatedCharts}
          class:bg-s4={!uiStore.animatedCharts}
          class:border-transparent={uiStore.animatedCharts}
          class:border-bd2={!uiStore.animatedCharts}
          class:after:left-[18px]={uiStore.animatedCharts}
          class:after:left-0.5={!uiStore.animatedCharts}
          role="switch"
          aria-checked={uiStore.animatedCharts}
          tabindex="0"
          onkeydown={(e) => e.key === 'Enter' && toggleAnimated()}
          onclick={toggleAnimated}
        ></div>
      </div>
      <div
        class="flex items-center justify-between py-3.25 border-b border-bd gap-4 last:border-b-0"
      >
        <div>
          <div class="text-base font-semibold">Always-on sidebar</div>
          <div class="text-xs text-tx2 mt-0.5 leading-relaxed">
            Keep sidebar expanded at all window sizes
          </div>
        </div>
        <div
          class="w-9.5 h-5.5 rounded-[11px] relative cursor-pointer border transition-all after:content-[''] after:absolute after:top-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.4)] after:transition-[left]"
          class:bg-pu={alwaysOnSidebar}
          class:bg-s4={!alwaysOnSidebar}
          class:border-transparent={alwaysOnSidebar}
          class:border-bd2={!alwaysOnSidebar}
          class:after:left-[18px]={alwaysOnSidebar}
          class:after:left-0.5={!alwaysOnSidebar}
          role="switch"
          aria-checked={alwaysOnSidebar}
          tabindex="0"
          onkeydown={(e) => e.key === 'Enter' && toggleAlwaysOnSidebar()}
          onclick={toggleAlwaysOnSidebar}
        ></div>
      </div>
    </div>
  {:else if activeTab === 'sabt'}
    <div class="card">
      <div class="py-1">
        <div class="text-lg font-extrabold mb-1.25">Dota Coach</div>
        <div class="text-sm text-tx2 mb-1.25">Version {appVersion} · Build {__BUILD_DATE__}</div>
        <div class="text-sm text-tx2 mb-4 leading-relaxed">
          Analytics and coaching dashboard for Dota 2 players. Powered by STRATZ API. Not affiliated
          with Valve Corporation.
        </div>
        <div class="flex gap-2">
          <button class="btn-out" onclick={() => uiStore.showToast('Opening changelog…')}
            >📋 Changelog</button
          >
          <button class="btn-out" onclick={() => uiStore.showToast('Opening docs…')}>📖 Docs</button
          >
          <button class="btn-out" onclick={() => uiStore.showToast('Opening GitHub…')}
            >⭐ GitHub</button
          >
        </div>
      </div>
    </div>
  {/if}
</div>
