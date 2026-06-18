<script lang="ts">
  import { type MockMatch, TIMELINE, INSIGHTS, TEAM_DATA } from '../utils/mockData'

  interface Props {
    match: MockMatch
  }
  let { match }: Props = $props()

  let activeSubTab = $state('md-overview')

  const kda = $derived(((match.k + match.a) / Math.max(match.d, 1)).toFixed(2))
</script>

<div class="flex-1 overflow-hidden flex flex-col select-none">
  <!-- HEADER -->
  <div class="bg-s1 border-b border-bd p-[18px_20px] flex items-start gap-[18px] shrink-0">
    <div class="w-16 h-16 rounded-[11px] flex items-center justify-center text-[34px] shrink-0 {match.outcome === 'win' ? 'bg-linear-to-br from-gr/20 to-gr/5 border border-gr/30' : 'bg-linear-to-br from-rd/20 to-rd/5 border border-rd/30'}">
      {match.icon}
    </div>
    <div class="flex-1 min-w-0">
      <div class="font-mono text-[24px] font-bold leading-none tracking-tight {match.outcome === 'win' ? 'text-gr' : 'text-rd'}">
        {match.outcome === 'win' ? 'Victory' : 'Defeat'}
      </div>
      <div class="flex items-center gap-[7px] mt-1.5 flex-wrap">
        <span class="badge">{match.hero}</span>
        <span class="badge">{match.role}</span>
        <span class="badge">{match.mode}</span>
        <span class="badge">Level {match.level}</span>
        <span class="badge">{match.dur}</span>
        <span class="badge text-tx3">{match.ago}</span>
      </div>
      <div class="flex gap-5 mt-3">
        <div class="flex flex-col gap-0.5"><div class="font-mono text-[15px] font-bold text-gd">{match.gpm}</div><div class="text-[9.5px] text-tx3 uppercase tracking-[0.5px]">GPM</div></div>
        <div class="flex flex-col gap-0.5"><div class="font-mono text-[15px] font-bold text-bl">{match.xpm}</div><div class="text-[9.5px] text-tx3 uppercase tracking-[0.5px]">XPM</div></div>
        <div class="flex flex-col gap-0.5"><div class="font-mono text-[15px] font-bold">{match.lh}</div><div class="text-[9.5px] text-tx3 uppercase tracking-[0.5px]">LH / DN</div></div>
        <div class="flex flex-col gap-0.5"><div class="font-mono text-[15px] font-bold text-gr">{match.nw}</div><div class="text-[9.5px] text-tx3 uppercase tracking-[0.5px]">Net Worth</div></div>
        <div class="flex flex-col gap-0.5"><div class="font-mono text-[15px] font-bold text-pu2">{kda}</div><div class="text-[9.5px] text-tx3 uppercase tracking-[0.5px]">KDA Ratio</div></div>
      </div>
    </div>
    <div class="flex gap-[18px] ml-auto items-end">
      <div class="text-center"><div class="font-mono text-[26px] font-bold leading-none text-gr">{match.k}</div><div class="text-[9px] text-tx3 uppercase tracking-[0.6px] mt-0.75">Kills</div></div>
      <div class="text-center"><div class="font-mono text-[26px] font-bold leading-none text-rd">{match.d}</div><div class="text-[9px] text-tx3 uppercase tracking-[0.6px] mt-0.75">Deaths</div></div>
      <div class="text-center"><div class="font-mono text-[26px] font-bold leading-none text-bl">{match.a}</div><div class="text-[9px] text-tx3 uppercase tracking-[0.6px] mt-0.75">Assists</div></div>
    </div>
    <button class="btn-out self-center ml-4">▶ Replay</button>
  </div>

  <!-- INVENTORY BAR -->
  <div class="flex items-center gap-1.25 p-[10px_20px] border-b border-bd bg-s1 shrink-0">
    <span class="text-[10px] text-tx3 uppercase tracking-[0.6px] font-bold mr-1 whitespace-nowrap">Items</span>
    {#each match.items as it}
      <div class="w-[38px] h-[28px] rounded-md flex items-center justify-center text-[15px] transition-transform hover:scale-110 {it ? 'bg-s3 border border-bd2' : 'bg-white/[0.015] border border-dashed border-white/[0.07]'}">
        {it}
      </div>
    {/each}
  </div>

  <!-- SUBTABS -->
  <div class="flex border-b border-bd px-5 shrink-0 bg-s1">
    <button class="p-[9px_13px] text-[12px] font-semibold transition-all border-b-2 bg-transparent cursor-pointer -mb-px {activeSubTab === 'md-overview' ? 'text-tx border-pu' : 'text-tx2 border-transparent hover:text-tx'}" onclick={() => activeSubTab = 'md-overview'}>Overview</button>
    <button class="p-[9px_13px] text-[12px] font-semibold transition-all border-b-2 bg-transparent cursor-pointer -mb-px {activeSubTab === 'md-timeline' ? 'text-tx border-pu' : 'text-tx2 border-transparent hover:text-tx'}" onclick={() => activeSubTab = 'md-timeline'}>Timeline</button>
    <button class="p-[9px_13px] text-[12px] font-semibold transition-all border-b-2 bg-transparent cursor-pointer -mb-px {activeSubTab === 'md-gold' ? 'text-tx border-pu' : 'text-tx2 border-transparent hover:text-tx'}" onclick={() => activeSubTab = 'md-gold'}>Gold Adv.</button>
    <button class="p-[9px_13px] text-[12px] font-semibold transition-all border-b-2 bg-transparent cursor-pointer -mb-px {activeSubTab === 'md-insights' ? 'text-tx border-pu' : 'text-tx2 border-transparent hover:text-tx'}" onclick={() => activeSubTab = 'md-insights'}>Key Insights</button>
  </div>

  <!-- TAB BODY -->
  <div class="flex-1 overflow-y-auto">
    {#if activeSubTab === 'md-overview'}
      <div class="grid grid-cols-2">
        <div class="p-[16px_20px] border-r border-bd">
          <div class="text-[10.5px] font-bold text-tx2 uppercase tracking-[0.5px] mb-2.25">Gold Advantage</div>
          <svg viewBox="0 0 210 95" class="w-full h-auto">
            <defs><linearGradient id="gag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#22C55E" stop-opacity=".3"/><stop offset="100%" stop-color="#22C55E" stop-opacity="0"/></linearGradient></defs>
            <line x1="0" y1="47" x2="210" y2="47" stroke="rgba(255,255,255,.06)" stroke-width="1"/>
            <text x="0" y="11" fill="#4A5270" font-size="8.5">+8k</text><text x="0" y="47" fill="#4A5270" font-size="8.5" dominant-baseline="middle">0</text><text x="0" y="86" fill="#4A5270" font-size="8.5">-4k</text>
            <path d="M12,54 L48,52 L84,46 L120,38 L156,28 L186,18 L210,12" fill="none" stroke="#22C55E" stroke-width="2"/>
            <path d="M12,54 L48,52 L84,46 L120,38 L156,28 L186,18 L210,12 L210,47 L12,47Z" fill="url(#gag)"/>
            <text x="12" y="92" fill="#4A5270" font-size="7.5">0:00</text><text x="110" y="92" fill="#4A5270" font-size="7.5" text-anchor="middle">17:10</text><text x="206" y="92" fill="#4A5270" font-size="7.5" text-anchor="end">34:21</text>
          </svg>
        </div>
        <div class="p-[16px_20px]">
          <div class="text-[10.5px] font-bold text-tx2 uppercase tracking-[0.5px] mb-2.25">XP Advantage</div>
          <svg viewBox="0 0 210 95" class="w-full h-auto">
            <defs><linearGradient id="xag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#38BDF8" stop-opacity=".3"/><stop offset="100%" stop-color="#38BDF8" stop-opacity="0"/></linearGradient></defs>
            <line x1="0" y1="47" x2="210" y2="47" stroke="rgba(255,255,255,.06)" stroke-width="1"/>
            <text x="0" y="11" fill="#4A5270" font-size="8.5">+8k</text><text x="0" y="47" fill="#4A5270" font-size="8.5" dominant-baseline="middle">0</text><text x="0" y="86" fill="#4A5270" font-size="8.5">-4k</text>
            <path d="M12,57 L38,60 L60,52 L88,40 L114,48 L146,32 L178,20 L210,13" fill="none" stroke="#38BDF8" stroke-width="2"/>
            <path d="M12,57 L38,60 L60,52 L88,40 L114,48 L146,32 L178,20 L210,13 L210,47 L12,47Z" fill="url(#xag)"/>
            <text x="12" y="92" fill="#4A5270" font-size="7.5">0:00</text><text x="110" y="92" fill="#4A5270" font-size="7.5" text-anchor="middle">17:10</text><text x="206" y="92" fill="#4A5270" font-size="7.5" text-anchor="end">34:21</text>
          </svg>
        </div>
      </div>
      <div class="p-[14px_20px] border-t border-bd">
        <div class="text-[10.5px] font-bold text-tx2 uppercase tracking-[0.5px] mb-2.75">Team Breakdown</div>
        <table class="w-full border-collapse text-[12px]">
          <thead>
            <tr>
              <th class="text-left p-[7px_10px] text-[10px] text-tx3 font-bold uppercase tracking-[0.6px] border-b border-bd">Player</th>
              <th class="p-[7px_10px] text-[10px] text-tx3 font-bold uppercase tracking-[0.6px] border-b border-bd text-center">K</th>
              <th class="p-[7px_10px] text-[10px] text-tx3 font-bold uppercase tracking-[0.6px] border-b border-bd text-center">D</th>
              <th class="p-[7px_10px] text-[10px] text-tx3 font-bold uppercase tracking-[0.6px] border-b border-bd text-center">A</th>
              <th class="p-[7px_10px] text-[10px] text-tx3 font-bold uppercase tracking-[0.6px] border-b border-bd text-center">GPM</th>
              <th class="p-[7px_10px] text-[10px] text-tx3 font-bold uppercase tracking-[0.6px] border-b border-bd text-center">Net Worth</th>
            </tr>
          </thead>
          <tbody>
            {#each TEAM_DATA as p}
              <tr class="group {p.you ? 'bg-pu/6' : ''} hover:bg-white/[0.018]">
                <td class="p-2 border-b border-white/5 vertical-middle group-last:border-b-0">
                  <div class="flex items-center gap-2">
                    <span class="text-[17px]">{p.ico}</span>
                    <span class="font-medium {p.you ? 'text-pu2 font-bold' : 'text-tx'}">
                      {p.name} {#if p.you}<span class="text-[10px] text-tx3 font-medium">(you)</span>{/if}
                    </span>
                  </div>
                </td>
                <td class="p-2 border-b border-white/5 vertical-middle group-last:border-b-0 font-mono font-bold text-center text-gr">{p.k}</td>
                <td class="p-2 border-b border-white/5 vertical-middle group-last:border-b-0 font-mono font-bold text-center text-rd">{p.d}</td>
                <td class="p-2 border-b border-white/5 vertical-middle group-last:border-b-0 font-mono font-bold text-center text-bl">{p.a}</td>
                <td class="p-2 border-b border-white/5 vertical-middle group-last:border-b-0 font-mono font-bold text-center text-gd">{p.gpm}</td>
                <td class="p-2 border-b border-white/5 vertical-middle group-last:border-b-0 font-mono font-bold text-center">{p.nw}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else if activeSubTab === 'md-timeline'}
      <div class="p-[10px_20px]">
        {#each TIMELINE as e}
          <div class="flex items-start gap-[11px] py-1.75 border-b border-white/3 last:border-b-0">
            <div class="text-tx3 w-9 font-mono text-[11px] shrink-0 pt-0.5">{e.time}</div>
            <div class="w-[7px] h-[7px] rounded-full shrink-0 mt-1" style="background: {e.c}"></div>
            <div class="text-tx2 flex-1 leading-relaxed text-[12px]">{@html e.ev}</div>
          </div>
        {/each}
      </div>
    {:else if activeSubTab === 'md-gold'}
      <div class="p-[16px_20px]">
        <div class="text-[10.5px] font-bold text-tx2 uppercase tracking-[0.5px] mb-2">Net Worth Over Time</div>
        <svg viewBox="0 0 520 125" class="w-full h-auto mt-2">
          <defs>
            <linearGradient id="gaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#22C55E" stop-opacity=".32"/><stop offset="100%" stop-color="#22C55E" stop-opacity=".03"/></linearGradient>
            <linearGradient id="raf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F04545" stop-opacity=".22"/><stop offset="100%" stop-color="#F04545" stop-opacity=".03"/></linearGradient>
          </defs>
          <line x1="32" y1="18" x2="512" y2="18" stroke="rgba(255,255,255,.04)" stroke-width="1"/>
          <line x1="32" y1="62" x2="512" y2="62" stroke="rgba(255,255,255,.06)" stroke-width="1"/>
          <line x1="32" y1="106" x2="512" y2="106" stroke="rgba(255,255,255,.04)" stroke-width="1"/>
          <text x="0" y="21" fill="#4A5270" font-size="8.5">+10k</text><text x="6" y="65" fill="#4A5270" font-size="8.5">0</text><text x="0" y="109" fill="#4A5270" font-size="8.5">-10k</text>
          <path d="M32,64 L100,62 L168,55 L236,46 L304,37 L372,28 L440,22 L512,16" fill="none" stroke="#22C55E" stroke-width="2.2"/>
          <path d="M32,64 L100,62 L168,55 L236,46 L304,37 L372,28 L440,22 L512,16 L512,62 L32,62Z" fill="url(#gaf)"/>
          <path d="M32,64 L100,67 L168,71 L236,75 L304,78 L372,82 L440,86 L512,90" fill="none" stroke="#F04545" stroke-width="2.2" stroke-dasharray="5,3"/>
          <path d="M32,64 L100,67 L168,71 L236,75 L304,78 L372,82 L440,86 L512,90 L512,62 L32,62Z" fill="url(#raf)"/>
          <text x="32" y="120" fill="#4A5270" font-size="8" text-anchor="middle">0:00</text><text x="168" y="120" fill="#4A5270" font-size="8" text-anchor="middle">8:35</text><text x="304" y="120" fill="#4A5270" font-size="8" text-anchor="middle">17:10</text><text x="440" y="120" fill="#4A5270" font-size="8" text-anchor="middle">25:45</text><text x="510" y="120" fill="#4A5270" font-size="8" text-anchor="end">34:21</text>
          <rect x="360" y="16" width="8" height="8" rx="1" fill="#22C55E"/><text x="372" y="23" fill="#8892AB" font-size="8.5">Radiant</text>
          <rect x="430" y="16" width="18" height="2" rx="1" fill="#F04545"/><text x="452" y="23" fill="#8892AB" font-size="8.5">Dire</text>
        </svg>
      </div>
    {:else if activeSubTab === 'md-insights'}
      <div class="p-[10px_20px]">
        <div class="flex flex-col">
          {#each INSIGHTS as i}
            <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
              <div class="text-[17px] shrink-0 mt-0.5">{i.ico}</div>
              <div>
                <div class="text-[12.5px] font-bold mb-0.75" style="color: {i.c}">{i.ttl}</div>
                <div class="text-[11.5px] text-tx2 leading-relaxed">{i.body}</div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
