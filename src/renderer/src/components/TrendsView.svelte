<script lang="ts">
  import { HEROES } from '../utils/mockData'

  let activePeriod = $state('7D')
</script>

<div class="flex-1 overflow-y-auto p-4 select-none">
  <div class="flex items-center justify-end mb-4">
    <div class="flex gap-1">
      {#each ['7D', '30D', '60D', 'All'] as p}
        <button
          class="px-[11px] py-1.25 rounded-lg border text-xs font-semibold cursor-pointer transition-all bg-transparent {activePeriod === p ? 'bg-pub border-pu text-pu2' : 'border-bd text-tx2 hover:border-bd2 hover:text-tx'}"
          onclick={() => activePeriod = p}
        >{p}</button>
      {/each}
    </div>
  </div>

  <div class="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 mb-4">
    <div class="bg-s1 border border-bd rounded-lg p-4">
      <div class="text-xxs font-bold text-tx3 uppercase tracking-[0.7px] mb-1">Total Matches</div>
      <div class="text-2xl font-extrabold text-pu tabular-nums">127</div>
      <div class="text-xs text-tx2 mt-1"><span class="text-gr font-semibold">↑ 23</span> this month</div>
    </div>
    <div class="bg-s1 border border-bd rounded-lg p-4">
      <div class="text-xxs font-bold text-tx3 uppercase tracking-[0.7px] mb-1">Avg Match Length</div>
      <div class="text-2xl font-extrabold text-gd tabular-nums">38:14</div>
      <div class="text-xs text-tx2 mt-1"><span class="text-rd font-semibold">↓ 2:10</span> vs last month</div>
    </div>
    <div class="bg-s1 border border-bd rounded-lg p-4">
      <div class="text-xxs font-bold text-tx3 uppercase tracking-[0.7px] mb-1">Hero Pool Size</div>
      <div class="text-2xl font-extrabold text-gr tabular-nums">12</div>
      <div class="text-xs text-tx2 mt-1"><span class="text-gr font-semibold">↑ 2</span> heroes added</div>
    </div>
  </div>

  <div class="grid lg:grid-cols-2 grid-cols-1 gap-4 mb-4">
    <div class="bg-s1 border border-bd rounded-lg p-4">
      <div class="flex items-center justify-between mb-3">
        <span class="card-ttl">Win Rate Trend</span>
        <span class="text-sm font-bold text-gr tabular-nums">57.1%</span>
      </div>
      <svg viewBox="0 0 300 110" class="w-full h-auto">
        <line x1="28" y1="20" x2="292" y2="20" stroke="rgba(255,255,255,.04)"/>
        <line x1="28" y1="55" x2="292" y2="55" stroke="rgba(255,255,255,.06)"/>
        <line x1="28" y1="90" x2="292" y2="90" stroke="rgba(255,255,255,.04)"/>
        <text x="0" y="23" fill="var(--color-tx3)" font-size="8.5">75%</text>
        <text x="0" y="58" fill="var(--color-tx3)" font-size="8.5">50%</text>
        <text x="0" y="93" fill="var(--color-tx3)" font-size="8.5">25%</text>
        <path d="M28,74 L66,67 L104,71 L142,60 L180,48 L218,42 L256,36 L292,28" fill="none" stroke="var(--color-gr)" stroke-width="2.2"/>
        <path d="M28,74 L66,67 L104,71 L142,60 L180,48 L218,42 L256,36 L292,28 L292,90 L28,90Z" fill="var(--color-gr)" fill-opacity="0.08"/>
        <text x="28" y="106" fill="var(--color-tx3)" font-size="8" text-anchor="middle">Apr 13</text>
        <text x="160" y="106" fill="var(--color-tx3)" font-size="8" text-anchor="middle">Apr 27</text>
        <text x="290" y="106" fill="var(--color-tx3)" font-size="8" text-anchor="end">May 11</text>
      </svg>
    </div>

    <div class="bg-s1 border border-bd rounded-lg p-4">
      <div class="flex items-center justify-between mb-3">
        <span class="card-ttl">GPM Trend</span>
        <span class="text-sm font-bold text-gd tabular-nums">542 avg</span>
      </div>
      <svg viewBox="0 0 300 110" class="w-full h-auto">
        <line x1="28" y1="20" x2="292" y2="20" stroke="rgba(255,255,255,.04)"/>
        <line x1="28" y1="55" x2="292" y2="55" stroke="rgba(255,255,255,.06)"/>
        <line x1="28" y1="90" x2="292" y2="90" stroke="rgba(255,255,255,.04)"/>
        <text x="0" y="23" fill="var(--color-tx3)" font-size="8.5">700</text>
        <text x="0" y="58" fill="var(--color-tx3)" font-size="8.5">500</text>
        <text x="0" y="93" fill="var(--color-tx3)" font-size="8.5">300</text>
        <path d="M28,70 L66,78 L104,66 L142,72 L180,58 L218,52 L256,45 L292,38" fill="none" stroke="var(--color-gd)" stroke-width="2.2"/>
        <path d="M28,70 L66,78 L104,66 L142,72 L180,58 L218,52 L256,45 L292,38 L292,90 L28,90Z" fill="var(--color-gd)" fill-opacity="0.08"/>
        <text x="28" y="106" fill="var(--color-tx3)" font-size="8" text-anchor="middle">Apr 13</text>
        <text x="292" y="106" fill="var(--color-tx3)" font-size="8" text-anchor="end">May 11</text>
      </svg>
    </div>
  </div>

  <div class="grid lg:grid-cols-2 grid-cols-1 gap-4 mb-4">
    <div class="bg-s1 border border-bd rounded-lg p-4">
      <div class="card-hd"><span class="card-ttl">Win Rate by Role</span></div>
      <div class="flex flex-col gap-[9px] pt-1">
        <div>
          <div class="flex justify-between text-xs mb-1"><span class="font-semibold text-tx">Core (Carry)</span><span class="text-sm font-bold text-pu2">61%</span></div>
          <div class="h-[6px] bg-s3 rounded-sm overflow-hidden"><div class="h-full bg-pu2 rounded-sm" style="width: 61%"></div></div>
        </div>
        <div>
          <div class="flex justify-between text-xs mb-1"><span class="font-semibold text-tx">Mid Lane</span><span class="text-sm font-bold text-gr">54%</span></div>
          <div class="h-[6px] bg-s3 rounded-sm overflow-hidden"><div class="h-full bg-gr rounded-sm" style="width: 54%"></div></div>
        </div>
        <div>
          <div class="flex justify-between text-xs mb-1"><span class="font-semibold text-tx">Support</span><span class="text-sm font-bold text-gd">48%</span></div>
          <div class="h-[6px] bg-s3 rounded-sm overflow-hidden"><div class="h-full bg-gd rounded-sm" style="width: 48%"></div></div>
        </div>
        <div>
          <div class="flex justify-between text-xs mb-1"><span class="font-semibold text-tx">Offlane</span><span class="text-sm font-bold text-rd">38%</span></div>
          <div class="h-[6px] bg-s3 rounded-sm overflow-hidden"><div class="h-full bg-rd rounded-sm" style="width: 38%"></div></div>
        </div>
      </div>
    </div>
    <div class="bg-s1 border border-bd rounded-lg p-4">
      <div class="card-hd"><span class="card-ttl">Games by Role</span></div>
      <div class="flex flex-col gap-2.5 pt-1">
        <div class="flex items-center gap-2.5 text-sm">
          <div class="w-2.5 h-2.5 rounded-[3px] bg-pu2 shrink-0"></div>
          <span class="text-tx2">Core (Carry)</span>
          <span class="ml-auto font-bold text-pu2 tabular-nums">45%</span>
        </div>
        <div class="flex items-center gap-2.5 text-sm">
          <div class="w-2.5 h-2.5 rounded-[3px] bg-gr shrink-0"></div>
          <span class="text-tx2">Mid Lane</span>
          <span class="ml-auto font-bold text-gr tabular-nums">25%</span>
        </div>
        <div class="flex items-center gap-2.5 text-sm">
          <div class="w-2.5 h-2.5 rounded-[3px] bg-gd shrink-0"></div>
          <span class="text-tx2">Support</span>
          <span class="ml-auto font-bold text-gd tabular-nums">17%</span>
        </div>
        <div class="flex items-center gap-2.5 text-sm">
          <div class="w-2.5 h-2.5 rounded-[3px] bg-bl shrink-0"></div>
          <span class="text-tx2">Offlane</span>
          <span class="ml-auto font-bold text-tx2 tabular-nums">13%</span>
        </div>
      </div>
    </div>
  </div>

  <div class="bg-s1 border border-bd rounded-lg">
    <div class="card-hd"><span class="card-ttl">Win Rate by Hero</span></div>
    <div class="flex flex-col px-4 pb-2">
      {#each HEROES as h}
        {@const color = h.winrate >= 60 ? 'var(--color-gr)' : h.winrate >= 50 ? 'var(--color-gd)' : 'var(--color-rd)'}
        <div class="flex items-center gap-[10px] py-1.5 border-b border-bd last:border-b-0">
          <span class="text-base w-[20px] text-center shrink-0">{h.icon}</span>
          <span class="text-sm font-semibold w-[120px] truncate text-tx">{h.name}</span>
          <div class="flex-1 bg-s3 rounded-sm h-[6px] overflow-hidden">
            <div class="h-full rounded-sm" style="background: {color}; width: {h.winrate}%"></div>
          </div>
          <span class="text-xs font-bold w-[34px] text-right tabular-nums" style="color: {color}">{h.winrate}%</span>
          <span class="text-xxs text-tx3 w-[40px] text-right tabular-nums">{h.matches}g</span>
        </div>
      {/each}
    </div>
  </div>
</div>
