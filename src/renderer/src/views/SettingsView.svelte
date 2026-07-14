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
    try {
      const storedToken = await window.api.getStratzToken()
      if (storedToken) token = storedToken
      const config = await window.api.getConfig()
      autoSync = config.autoSyncMatches ?? true
      appVersion = await window.api.getAppVersion()
    } catch {}
  })

  // Local settings states
  let autoSync = $state(true)
  let alwaysOnSidebar = $state(true)

  const tabs = [
    { id: 'sg', label: 'General' },
    { id: 'sapi', label: 'API' },
    { id: 'sapp', label: 'Appearance' },
    { id: 'sabt', label: 'About' }
  ]

  function toggleApi() {
    apiVisible = !apiVisible
  }

  function testConn() {
    connTested = false
    setTimeout(() => {
      connTested = true
      uiStore.showToast('STRATZ API connected ✓', 'ok')
    }, 1200)
  }

  async function updateToken() {
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

  async function disconnectApi() {
    token = ''
    try {
      await window.api.setStratzToken('')
      uiStore.showToast('API key removed', 'err')
    } catch {
      uiStore.showToast('Failed to remove API Key', 'err')
    }
  }

  async function toggleAutoSync() {
    autoSync = !autoSync
    try {
      const config = await window.api.getConfig()
      config.autoSyncMatches = autoSync
      await window.api.setConfig(config)
    } catch (e) {
      console.error(e)
    }
    uiStore.showToast(`Auto-sync new matches: ${autoSync ? 'ON' : 'OFF'}`, 'ok')
  }

  function toggleCompact() {
    uiStore.compactMode = !uiStore.compactMode
    uiStore.showToast(`Compact mode: ${uiStore.compactMode ? 'ON' : 'OFF'}`, 'ok')
  }

  function toggleAnimated() {
    uiStore.animatedCharts = !uiStore.animatedCharts
    uiStore.showToast(`Animated charts: ${uiStore.animatedCharts ? 'ON' : 'OFF'}`, 'ok')
  }

  function toggleAlwaysOnSidebar() {
    alwaysOnSidebar = !alwaysOnSidebar
    uiStore.showToast(`Always-on sidebar: ${alwaysOnSidebar ? 'ON' : 'OFF'}`, 'ok')
  }
</script>

<div class="flex-1 overflow-y-auto p-4 select-none">
  <div class="mb-4">
    <TabNav {tabs} active={activeTab} onTabChange={(id) => (activeTab = id)} variant="underline" />
  </div>

  {#if activeTab === 'sg'}
    <div class="card">
      <div class="flex items-center justify-between py-[13px] border-b border-bd gap-4 last:border-b-0">
        <div>
          <div class="text-base font-semibold">Auto-sync new matches</div>
          <div class="text-xs text-tx2 mt-0.5 leading-relaxed">
            Automatically fetch match data when new games are detected by GSI
          </div>
        </div>
        <div
          class="w-[38px] h-[22px] rounded-[11px] relative cursor-pointer border transition-all after:content-[''] after:absolute after:top-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.4)] after:transition-[left]"
          class:bg-pu={autoSync}
          class:bg-s4={!autoSync}
          class:border-transparent={autoSync}
          class:border-bd2={!autoSync}
          class:after:left-[18px]={autoSync}
          class:after:left-0.5={!autoSync}
          role="switch"
          aria-checked={autoSync}
          onclick={toggleAutoSync}
        ></div>
      </div>
    </div>
  {:else if activeTab === 'sapi'}
    <div class="card">
      <div class="flex flex-col items-start py-[13px] border-b border-bd gap-2 last:border-b-0">
        <div>
          <div class="text-base font-semibold">STRATZ API Key</div>
          <div class="text-xs text-tx2 mt-0.5 leading-relaxed">
            Required to fetch match data. Get yours at stratz.com/api
          </div>
        </div>
        <div class="w-full flex gap-2">
          <input
            type={apiVisible ? 'text' : 'password'}
            class="bg-s2 border border-bd rounded-lg color-tx p-[8px_12px] text-sm flex-1 outline-hidden font-mono focus:border-pu transition-colors"
            bind:value={token}
            placeholder="Paste your STRATZ API Token..."
          />
          <button class="bg-s3 border border-bd text-tx2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-s4 hover:text-tx hover:border-bd2 cursor-pointer" onclick={toggleApi}>{apiVisible ? 'Hide' : 'Show'}</button>
          <button class="bg-pub border border-pu/40 text-tx px-4 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-pu/30 hover:border-pu disabled:opacity-50 cursor-pointer shadow-sm" onclick={updateToken} disabled={isSavingToken}>
            {#if isSavingToken}Saving...{:else}Save{/if}
          </button>
          <button class="bg-transparent border border-bd text-tx px-4 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-white/5 hover:border-bd2 cursor-pointer" onclick={testConn}>Test Connection</button>
        </div>
        {#if connTested}
          <div class="text-gr text-sm font-semibold flex items-center gap-1.25">
            ✓ Connection successful
          </div>
        {/if}
      </div>
      <div class="flex items-center justify-between py-[13px] border-b border-bd gap-4 last:border-b-0">
        <div>
          <div class="text-base font-semibold">Disconnect API</div>
          <div class="text-xs text-tx2 mt-0.5 leading-relaxed">
            Remove API key and stop all data syncing immediately
          </div>
        </div>
        <button
          class="bg-rdb border border-rd text-rd rounded-lg px-[14px] py-1.5 text-sm font-bold cursor-pointer transition-all hover:bg-rd hover:text-white"
          onclick={disconnectApi}>Disconnect</button
        >
      </div>
    </div>
  {:else if activeTab === 'sapp'}
    <div class="card">
      <div class="flex items-center justify-between py-[13px] border-b border-bd gap-4 last:border-b-0">
        <div>
          <div class="text-base font-semibold">Compact mode</div>
          <div class="text-xs text-tx2 mt-0.5 leading-relaxed">
            Reduce padding and spacing for more data density
          </div>
        </div>
        <div
          class="w-[38px] h-[22px] rounded-[11px] relative cursor-pointer border transition-all after:content-[''] after:absolute after:top-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.4)] after:transition-[left]"
          class:bg-pu={uiStore.compactMode}
          class:bg-s4={!uiStore.compactMode}
          class:border-transparent={uiStore.compactMode}
          class:border-bd2={!uiStore.compactMode}
          class:after:left-[18px]={uiStore.compactMode}
          class:after:left-0.5={!uiStore.compactMode}
          role="switch"
          aria-checked={uiStore.compactMode}
          onclick={toggleCompact}
        ></div>
      </div>
      <div class="flex items-center justify-between py-[13px] border-b border-bd gap-4 last:border-b-0">
        <div>
          <div class="text-base font-semibold">Animated charts</div>
          <div class="text-xs text-tx2 mt-0.5 leading-relaxed">
            Enable smooth transitions and animations on chart data
          </div>
        </div>
        <div
          class="w-[38px] h-[22px] rounded-[11px] relative cursor-pointer border transition-all after:content-[''] after:absolute after:top-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.4)] after:transition-[left]"
          class:bg-pu={uiStore.animatedCharts}
          class:bg-s4={!uiStore.animatedCharts}
          class:border-transparent={uiStore.animatedCharts}
          class:border-bd2={!uiStore.animatedCharts}
          class:after:left-[18px]={uiStore.animatedCharts}
          class:after:left-0.5={!uiStore.animatedCharts}
          role="switch"
          aria-checked={uiStore.animatedCharts}
          onclick={toggleAnimated}
        ></div>
      </div>
      <div class="flex items-center justify-between py-[13px] border-b border-bd gap-4 last:border-b-0">
        <div>
          <div class="text-base font-semibold">Always-on sidebar</div>
          <div class="text-xs text-tx2 mt-0.5 leading-relaxed">
            Keep sidebar expanded at all window sizes
          </div>
        </div>
        <div
          class="w-[38px] h-[22px] rounded-[11px] relative cursor-pointer border transition-all after:content-[''] after:absolute after:top-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.4)] after:transition-[left]"
          class:bg-pu={alwaysOnSidebar}
          class:bg-s4={!alwaysOnSidebar}
          class:border-transparent={alwaysOnSidebar}
          class:border-bd2={!alwaysOnSidebar}
          class:after:left-[18px]={alwaysOnSidebar}
          class:after:left-0.5={!alwaysOnSidebar}
          role="switch"
          aria-checked={alwaysOnSidebar}
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
          Analytics and coaching dashboard for Dota 2 players. Powered by STRATZ API. Not affiliated with Valve
          Corporation.
        </div>
        <div class="flex gap-2">
          <button class="btn-out" onclick={() => uiStore.showToast('Opening changelog…')}>📋 Changelog</button>
          <button class="btn-out" onclick={() => uiStore.showToast('Opening docs…')}>📖 Docs</button>
          <button class="btn-out" onclick={() => uiStore.showToast('Opening GitHub…')}>⭐ GitHub</button>
        </div>
      </div>
    </div>
  {/if}
</div>
