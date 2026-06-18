<script lang="ts">
  interface Props {
    showToast: (msg: string, type?: string) => void
  }
  let { showToast }: Props = $props()

  let activeTab = $state('sg')
  let apiVisible = $state(false)
  let connTested = $state(false)

  function toggleApi() { apiVisible = !apiVisible }
  function testConn() {
    connTested = false
    setTimeout(() => {
      connTested = true
      showToast('STRATZ API connected ✓', 'ok')
    }, 1200)
  }
</script>

<div class="flex-1 overflow-y-auto p-4 select-none">
  <div class="flex border-b border-bd mb-4">
    <button class="px-[17px] py-[9px] text-[12.5px] font-semibold transition-all border-b-2 bg-transparent cursor-pointer {activeTab === 'sg' ? 'text-tx border-pu' : 'text-tx2 border-transparent hover:text-tx'}" onclick={() => activeTab = 'sg'}>General</button>
    <button class="px-[17px] py-[9px] text-[12.5px] font-semibold transition-all border-b-2 bg-transparent cursor-pointer {activeTab === 'ssync' ? 'text-tx border-pu' : 'text-tx2 border-transparent hover:text-tx'}" onclick={() => activeTab = 'ssync'}>Sync</button>
    <button class="px-[17px] py-[9px] text-[12.5px] font-semibold transition-all border-b-2 bg-transparent cursor-pointer {activeTab === 'sapi' ? 'text-tx border-pu' : 'text-tx2 border-transparent hover:text-tx'}" onclick={() => activeTab = 'sapi'}>API</button>
    <button class="px-[17px] py-[9px] text-[12.5px] font-semibold transition-all border-b-2 bg-transparent cursor-pointer {activeTab === 'sapp' ? 'text-tx border-pu' : 'text-tx2 border-transparent hover:text-tx'}" onclick={() => activeTab = 'sapp'}>Appearance</button>
    <button class="px-[17px] py-[9px] text-[12.5px] font-semibold transition-all border-b-2 bg-transparent cursor-pointer {activeTab === 'sabt' ? 'text-tx border-pu' : 'text-tx2 border-transparent hover:text-tx'}" onclick={() => activeTab = 'sabt'}>About</button>
  </div>

  {#if activeTab === 'sg'}
    <div class="card">
      <div class="flex items-center justify-between py-[13px] border-b border-bd gap-4 last:border-b-0">
        <div><div class="text-[13px] font-semibold">Auto-sync new matches</div><div class="text-[11px] text-tx2 mt-0.5 leading-[1.5]">Automatically fetch match data when new games are detected</div></div>
        <div class="w-[38px] h-[22px] bg-pu rounded-[11px] relative cursor-pointer border border-transparent after:content-[''] after:absolute after:top-0.5 after:left-[18px] after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-all"></div>
      </div>
      <div class="flex items-center justify-between py-[13px] border-b border-bd gap-4 last:border-b-0">
        <div><div class="text-[13px] font-semibold">Desktop notifications</div><div class="text-[11px] text-tx2 mt-0.5 leading-[1.5]">Show alerts when sync completes or goals are achieved</div></div>
        <div class="w-[38px] h-[22px] bg-pu rounded-[11px] relative cursor-pointer border border-transparent after:content-[''] after:absolute after:top-0.5 after:left-[18px] after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-all"></div>
      </div>
      <div class="flex items-center justify-between py-[13px] border-b border-bd gap-4 last:border-b-0">
        <div><div class="text-[13px] font-semibold">Show MMR estimate</div><div class="text-[11px] text-tx2 mt-0.5 leading-[1.5]">Display estimated MMR based on match performance metrics</div></div>
        <div class="w-[38px] h-[22px] bg-pu rounded-[11px] relative cursor-pointer border border-transparent after:content-[''] after:absolute after:top-0.5 after:left-[18px] after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-all"></div>
      </div>
      <div class="flex items-center justify-between py-[13px] border-b border-bd gap-4 last:border-b-0">
        <div><div class="text-[13px] font-semibold">Coaching tips during replay</div><div class="text-[11px] text-tx2 mt-0.5 leading-[1.5]">Display AI coaching annotations while watching replays</div></div>
        <div class="w-[38px] h-[22px] bg-s4 rounded-[11px] relative cursor-pointer border border-bd2 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-all"></div>
      </div>
    </div>
  {:else if activeTab === 'ssync'}
    <div class="card">
      <div class="flex items-center justify-between py-[13px] border-b border-bd gap-4 last:border-b-0">
        <div><div class="text-[13px] font-semibold">Sync frequency</div><div class="text-[11px] text-tx2 mt-0.5 leading-[1.5]">How often to check for new matches in background</div></div>
        <select class="sel bg-s2"><option>Every 10 min</option><option>Every 30 min</option><option>Hourly</option><option>Manual only</option></select>
      </div>
      <div class="flex items-center justify-between py-[13px] border-b border-bd gap-4 last:border-b-0">
        <div><div class="text-[13px] font-semibold">Background sync</div><div class="text-[11px] text-tx2 mt-0.5 leading-[1.5]">Continue syncing when the app is minimized or closed</div></div>
        <div class="w-[38px] h-[22px] bg-pu rounded-[11px] relative cursor-pointer border border-transparent after:content-[''] after:absolute after:top-0.5 after:left-[18px] after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-all"></div>
      </div>
      <div class="flex items-center justify-between py-[13px] border-b border-bd gap-4 last:border-b-0">
        <div><div class="text-[13px] font-semibold">Last sync</div><div class="text-[11px] text-tx2 mt-0.5 leading-[1.5]">2 minutes ago · 4 new matches found</div></div>
        <button class="btn-pri">↻ Sync Now</button>
      </div>
    </div>
  {:else if activeTab === 'sapi'}
    <div class="card">
      <div class="flex flex-col items-start py-[13px] border-b border-bd gap-2 last:border-b-0">
        <div><div class="text-[13px] font-semibold">STRATZ API Key</div><div class="text-[11px] text-tx2 mt-0.5 leading-[1.5]">Required to fetch match data. Get yours at stratz.com/api</div></div>
        <div class="w-full flex gap-2">
          <input type={apiVisible ? 'text' : 'password'} class="bg-s2 border border-bd rounded-lg color-tx p-[8px_12px] text-[12px] flex-1 outline-hidden font-mono focus:border-pu transition-colors" value="stratz_abcdef1234567890abcdef" readonly />
          <button class="btn-out" onclick={toggleApi}>{apiVisible ? 'Hide' : 'Show'}</button>
          <button class="btn-pri" onclick={testConn}>Test Connection</button>
        </div>
        {#if connTested}
          <div class="text-gr text-[11.5px] font-semibold flex items-center gap-1.25">✓ Connection successful</div>
        {/if}
      </div>
      <div class="flex items-center justify-between py-[13px] border-b border-bd gap-4 last:border-b-0">
        <div><div class="text-[13px] font-semibold">Disconnect API</div><div class="text-[11px] text-tx2 mt-0.5 leading-[1.5]">Remove API key and stop all data syncing immediately</div></div>
        <button class="bg-rdb border border-rd text-rd rounded-lg px-[14px] py-1.5 text-[12px] font-bold cursor-pointer transition-all hover:bg-rd hover:text-white" onclick={() => showToast('API key removed', 'err')}>Disconnect</button>
      </div>
    </div>
  {:else if activeTab === 'sapp'}
    <div class="card">
      <div class="flex items-center justify-between py-[13px] border-b border-bd gap-4 last:border-b-0">
        <div><div class="text-[13px] font-semibold">Compact mode</div><div class="text-[11px] text-tx2 mt-0.5 leading-[1.5]">Reduce padding and spacing for more data density</div></div>
        <div class="w-[38px] h-[22px] bg-s4 rounded-[11px] relative cursor-pointer border border-bd2 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-all"></div>
      </div>
      <div class="flex items-center justify-between py-[13px] border-b border-bd gap-4 last:border-b-0">
        <div><div class="text-[13px] font-semibold">Animated charts</div><div class="text-[11px] text-tx2 mt-0.5 leading-[1.5]">Enable smooth transitions and animations on chart data</div></div>
        <div class="w-[38px] h-[22px] bg-pu rounded-[11px] relative cursor-pointer border border-transparent after:content-[''] after:absolute after:top-0.5 after:left-[18px] after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-all"></div>
      </div>
      <div class="flex items-center justify-between py-[13px] border-b border-bd gap-4 last:border-b-0">
        <div><div class="text-[13px] font-semibold">Color-blind mode</div><div class="text-[11px] text-tx2 mt-0.5 leading-[1.5]">Replace red/green win indicators with accessible patterns</div></div>
        <div class="w-[38px] h-[22px] bg-s4 rounded-[11px] relative cursor-pointer border border-bd2 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-all"></div>
      </div>
      <div class="flex items-center justify-between py-[13px] border-b border-bd gap-4 last:border-b-0">
        <div><div class="text-[13px] font-semibold">Always-on sidebar</div><div class="text-[11px] text-tx2 mt-0.5 leading-[1.5]">Keep sidebar expanded at all window sizes</div></div>
        <div class="w-[38px] h-[22px] bg-pu rounded-[11px] relative cursor-pointer border border-transparent after:content-[''] after:absolute after:top-0.5 after:left-[18px] after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-all"></div>
      </div>
    </div>
  {:else if activeTab === 'sabt'}
    <div class="card">
      <div class="py-1">
        <div class="text-[16px] font-extrabold mb-1.25">Dota Coach</div>
        <div class="text-[12px] text-tx2 mb-1.25">Version 2.4.1 · Build 20240512</div>
        <div class="text-[12px] text-tx2 mb-4 leading-[1.6]">Analytics and coaching dashboard for Dota 2 players. Powered by STRATZ API. Not affiliated with Valve Corporation.</div>
        <div class="flex gap-2">
          <button class="btn-out" onclick={() => showToast('Opening changelog…')}>📋 Changelog</button>
          <button class="btn-out" onclick={() => showToast('Opening docs…')}>📖 Docs</button>
          <button class="btn-out" onclick={() => showToast('Opening GitHub…')}>⭐ GitHub</button>
        </div>
      </div>
    </div>
  {/if}
</div>
