<script lang="ts">
  import { HEROES } from '../utils/mockData'

  let activeTab = $state('tr-perf')
  let activePeriod = $state('7D')
</script>

<div class="flex-1 overflow-y-auto p-4 select-none">
  <!-- HEADER CONTROLS -->
  <div class="flex items-center gap-2.5 mb-4">
    <div class="flex gap-0.5 bg-s2 rounded-lg p-0.75 w-fit">
      <button class="px-[13px] py-1.25 rounded-md border-none bg-transparent text-tx2 text-[12px] font-medium cursor-pointer transition-all {activeTab === 'tr-perf' ? 'bg-s4 text-tx' : 'hover:text-tx'}" onclick={() => activeTab = 'tr-perf'}>Performance</button>
      <button class="px-[13px] py-1.25 rounded-md border-none bg-transparent text-tx2 text-[12px] font-medium cursor-pointer transition-all {activeTab === 'tr-heroes' ? 'bg-s4 text-tx' : 'hover:text-tx'}" onclick={() => activeTab = 'tr-heroes'}>Heroes</button>
      <button class="px-[13px] py-1.25 rounded-md border-none bg-transparent text-tx2 text-[12px] font-medium cursor-pointer transition-all {activeTab === 'tr-roles' ? 'bg-s4 text-tx' : 'hover:text-tx'}" onclick={() => activeTab = 'tr-roles'}>Roles</button>
      <button class="px-[13px] py-1.25 rounded-md border-none bg-transparent text-tx2 text-[12px] font-medium cursor-pointer transition-all {activeTab === 'tr-ovr' ? 'bg-s4 text-tx' : 'hover:text-tx'}" onclick={() => activeTab = 'tr-ovr'}>Overview</button>
    </div>
    <div class="flex-1"></div>
    <div class="flex gap-1">
      {#each ['7D', '30D', '60D', 'All'] as p}
        <button class="px-[11px] py-1.25 rounded-lg border text-[11px] font-semibold cursor-pointer transition-all bg-transparent {activePeriod === p ? 'bg-pub border-pu text-pu2' : 'border-bd text-tx2'}" onclick={() => activePeriod = p}>{p}</button>
      {/each}
    </div>
  </div>

  {#if activeTab === 'tr-perf'}
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="card">
        <div class="card-hd"><span class="card-ttl">Win Rate Trend</span><span class="text-gr text-[11.5px] font-bold">57.1%</span></div>
        <svg viewBox="0 0 300 110" class="w-full h-auto">
          <defs>
            <linearGradient id="wrt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#22C55E" stop-opacity=".26"/>
              <stop offset="100%" stop-color="#22C55E" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <line x1="28" y1="20" x2="292" y2="20" stroke="rgba(255,255,255,.04)"/>
          <line x1="28" y1="55" x2="292" y2="55" stroke="rgba(255,255,255,.06)"/>
          <line x1="28" y1="90" x2="292" y2="90" stroke="rgba(255,255,255,.04)"/>
          <text x="0" y="23" fill="#4A5270" font-size="8.5">75%</text>
          <text x="0" y="58" fill="#4A5270" font-size="8.5">50%</text>
          <text x="0" y="93" fill="#4A5270" font-size="8.5">25%</text>
          <path d="M28,74 L66,67 L104,71 L142,60 L180,48 L218,42 L256,36 L292,28" fill="none" stroke="#22C55E" stroke-width="2.2"/>
          <path d="M28,74 L66,67 L104,71 L142,60 L180,48 L218,42 L256,36 L292,28 L292,90 L28,90Z" fill="url(#wrt)"/>
          <text x="28" y="106" fill="#4A5270" font-size="8" text-anchor="middle">Apr 13</text>
          <text x="160" y="106" fill="#4A5270" font-size="8" text-anchor="middle">Apr 27</text>
          <text x="290" y="106" fill="#4A5270" font-size="8" text-anchor="end">May 11</text>
        </svg>
      </div>

      <div class="card">
        <div class="card-hd"><span class="card-ttl">GPM Trend</span><span class="text-gd text-[11.5px] font-bold">542 avg</span></div>
        <svg viewBox="0 0 300 110" class="w-full h-auto">
          <defs>
            <linearGradient id="gpt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#F59E0B" stop-opacity=".26"/>
              <stop offset="100%" stop-color="#F59E0B" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <line x1="28" y1="20" x2="292" y2="20" stroke="rgba(255,255,255,.04)"/>
          <line x1="28" y1="55" x2="292" y2="55" stroke="rgba(255,255,255,.06)"/>
          <line x1="28" y1="90" x2="292" y2="90" stroke="rgba(255,255,255,.04)"/>
          <text x="0" y="23" fill="#4A5270" font-size="8.5">700</text>
          <text x="0" y="58" fill="#4A5270" font-size="8.5">500</text>
          <text x="0" y="93" fill="#4A5270" font-size="8.5">300</text>
          <path d="M28,70 L66,78 L104,66 L142,72 L180,58 L218,52 L256,45 L292,38" fill="none" stroke="#F59E0B" stroke-width="2.2"/>
          <path d="M28,70 L66,78 L104,66 L142,72 L180,58 L218,52 L256,45 L292,38 L292,90 L28,90Z" fill="url(#gpt)"/>
          <text x="28" y="106" fill="#4A5270" font-size="8" text-anchor="middle">Apr 13</text>
          <text x="292" y="106" fill="#4A5270" font-size="8" text-anchor="end">May 11</text>
        </svg>
      </div>
    </div>
  {:else if activeTab === 'tr-heroes'}
    <div class="card mb-4">
      <div class="card-hd"><span class="card-ttl">Win Rate by Hero</span></div>
      <div class="flex flex-col pt-0.5">
        {#each HEROES as h}
          {@const color = h.winrate >= 60 ? 'var(--color-gr)' : h.winrate >= 50 ? 'var(--color-gd)' : 'var(--color-rd)'}
          <div class="flex items-center gap-[11px] py-1.75 border-b border-bd last:border-b-0">
            <span class="text-[16px] w-[22px] text-center">{h.icon}</span>
            <span class="text-[12.5px] font-semibold w-[130px] truncate">{h.name}</span>
            <div class="flex-1 bg-s3 rounded-sm h-[7px] overflow-hidden">
              <div class="h-full rounded-sm" style="background: {color}; width: {h.winrate}%"></div>
            </div>
            <span class="text-[12px] font-bold w-[38px] text-right" style="color: {color}">{h.winrate}%</span>
            <span class="text-[10.5px] text-tx3 w-[48px] text-right">{h.matches}g</span>
          </div>
        {/each}
      </div>
    </div>
  {:else if activeTab === 'tr-roles'}
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="card">
        <div class="card-hd"><span class="card-ttl">Win Rate by Role</span></div>
        <div class="flex flex-col gap-[11px] pt-1">
          <div>
            <div class="flex justify-between text-[12px] mb-1.25"><span>Core (Carry)</span><span class="text-pu2 font-bold">61%</span></div>
            <div class="h-[7px] bg-s3 rounded-sm overflow-hidden"><div class="h-full bg-pu2 rounded-sm" style="width: 61%"></div></div>
          </div>
          <div>
            <div class="flex justify-between text-[12px] mb-1.25"><span>Mid Lane</span><span class="text-gr font-bold">54%</span></div>
            <div class="h-[7px] bg-s3 rounded-sm overflow-hidden"><div class="h-full bg-gr rounded-sm" style="width: 54%"></div></div>
          </div>
          <div>
            <div class="flex justify-between text-[12px] mb-1.25"><span>Support</span><span class="text-gd font-bold">48%</span></div>
            <div class="h-[7px] bg-s3 rounded-sm overflow-hidden"><div class="h-full bg-gd rounded-sm" style="width: 48%"></div></div>
          </div>
          <div>
            <div class="flex justify-between text-[12px] mb-1.25"><span>Offlane</span><span class="text-rd font-bold">38%</span></div>
            <div class="h-[7px] bg-s3 rounded-sm overflow-hidden"><div class="h-full bg-rd rounded-sm" style="width: 38%"></div></div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-hd"><span class="card-ttl">Games by Role</span></div>
        <div class="flex flex-col gap-2 pt-1">
          <div class="flex items-center gap-[9px] text-[12.5px]"><div class="w-2.5 h-2.5 rounded-xs bg-pu2 shrink-0"></div>Core (Carry)<span class="ml-auto font-bold">45%</span></div>
          <div class="flex items-center gap-[9px] text-[12.5px]"><div class="w-2.5 h-2.5 rounded-xs bg-gr shrink-0"></div>Mid Lane<span class="ml-auto font-bold">25%</span></div>
          <div class="flex items-center gap-[9px] text-[12.5px]"><div class="w-2.5 h-2.5 rounded-xs bg-gd shrink-0"></div>Support<span class="ml-auto font-bold">17%</span></div>
          <div class="flex items-center gap-[9px] text-[12.5px]"><div class="w-2.5 h-2.5 rounded-xs bg-bl shrink-0"></div>Offlane<span class="ml-auto font-bold">13%</span></div>
        </div>
      </div>
    </div>
  {:else if activeTab === 'tr-ovr'}
    <div class="grid grid-cols-3 gap-4 mb-4">
      <div class="kpi">
        <div class="kpi-lbl">Total Matches</div>
        <div class="kpi-val text-pu">127</div>
        <div class="text-[10.5px] text-tx2"><span class="text-gr">↑ 23</span> this month</div>
      </div>
      <div class="kpi">
        <div class="kpi-lbl">Avg Match Length</div>
        <div class="kpi-val text-gd">38:14</div>
        <div class="text-[10.5px] text-tx2"><span class="text-rd">↓ 2:10</span> vs last month</div>
      </div>
      <div class="kpi">
        <div class="kpi-lbl">Hero Pool Size</div>
        <div class="kpi-val text-gr">12</div>
        <div class="text-[10.5px] text-tx2"><span class="text-gr">↑ 2</span> heroes added</div>
      </div>
    </div>
  {/if}
</div>
