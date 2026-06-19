<script lang="ts">
  import { HEROES, MATCHES, type MockMatch } from '../utils/mockData'

  interface Props {
    openMatchDetail: (match: MockMatch) => void
    gotoView: (view: string) => void
  }
  let { openMatchDetail, gotoView }: Props = $props()
</script>

<div class="flex-1 overflow-y-auto p-4 select-none">
  <!-- KPI ROW -->
  <div class="grid grid-cols-4 gap-4 mb-4">
    <div class="kpi">
      <div class="kpi-lbl">Win Rate</div>
      <div class="kpi-val text-gr">57.1%</div>
      <div class="text-[10.5px] text-tx2 flex items-center gap-1">
        <span class="text-gr">↑ 6.2%</span> vs last 30
      </div>
      <svg class="h-[34px] w-full mt-2.5" viewBox="0 0 100 34" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sg1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#22C55E" stop-opacity=".3" />
            <stop offset="100%" stop-color="#22C55E" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,26 L14,22 L28,24 L42,17 L56,18 L70,12 L84,8 L100,4"
          fill="none"
          stroke="#22C55E"
          stroke-width="1.8"
        />
        <path
          d="M0,26 L14,22 L28,24 L42,17 L56,18 L70,12 L84,8 L100,4 L100,34 L0,34Z"
          fill="url(#sg1)"
        />
      </svg>
    </div>

    <div class="kpi">
      <div class="kpi-lbl">KDA Ratio</div>
      <div class="kpi-val text-pu2">3.45</div>
      <div class="text-[10.5px] text-tx2 flex items-center gap-1">
        <span class="text-gr">↑ 0.31</span> vs last 30
      </div>
      <svg class="h-[34px] w-full mt-2.5" viewBox="0 0 100 34" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#A78BFA" stop-opacity=".3" />
            <stop offset="100%" stop-color="#A78BFA" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,20 L14,18 L28,23 L42,16 L56,13 L70,16 L84,10 L100,6"
          fill="none"
          stroke="#A78BFA"
          stroke-width="1.8"
        />
        <path
          d="M0,20 L14,18 L28,23 L42,16 L56,13 L70,16 L84,10 L100,6 L100,34 L0,34Z"
          fill="url(#sg2)"
        />
      </svg>
    </div>

    <div class="kpi">
      <div class="kpi-lbl">Avg GPM</div>
      <div class="kpi-val text-gd">542</div>
      <div class="text-[10.5px] text-tx2 flex items-center gap-1">
        <span class="text-gr">↑ 47</span> vs last 30
      </div>
      <svg class="h-[34px] w-full mt-2.5" viewBox="0 0 100 34" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sg3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#F59E0B" stop-opacity=".3" />
            <stop offset="100%" stop-color="#F59E0B" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,24 L14,26 L28,20 L42,22 L56,16 L70,14 L84,11 L100,7"
          fill="none"
          stroke="#F59E0B"
          stroke-width="1.8"
        />
        <path
          d="M0,24 L14,26 L28,20 L42,22 L56,16 L70,14 L84,11 L100,7 L100,34 L0,34Z"
          fill="url(#sg3)"
        />
      </svg>
    </div>

    <div class="kpi">
      <div class="kpi-lbl">Hook Accuracy</div>
      <div class="kpi-val text-bl">38%</div>
      <div class="text-[10.5px] text-tx2 flex items-center gap-1">
        <span class="text-gr">↑ 5%</span> vs last 30
      </div>
      <svg class="h-[34px] w-full mt-2.5" viewBox="0 0 100 34" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sg4" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#38BDF8" stop-opacity=".3" />
            <stop offset="100%" stop-color="#38BDF8" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,22 L14,25 L28,20 L42,22 L56,18 L70,14 L84,10 L100,7"
          fill="none"
          stroke="#38BDF8"
          stroke-width="1.8"
        />
        <path
          d="M0,22 L14,25 L28,20 L42,22 L56,18 L70,14 L84,10 L100,7 L100,34 L0,34Z"
          fill="url(#sg4)"
        />
      </svg>
    </div>
  </div>

  <!-- MAIN DASHBOARD GRID -->
  <div class="grid grid-cols-[3fr_2fr] gap-4">
    <!-- LEFT PANEL: TRENDS & COACH -->
    <div class="flex flex-col gap-4">
      <div class="card">
        <div class="card-hd">
          <span class="card-ttl">Performance Trend</span>
          <div class="flex gap-3">
            <div class="flex items-center gap-1 text-[11px] text-tx2">
              <div class="w-[7px] h-[7px] rounded-full bg-gr"></div>
              Win Rate
            </div>
            <div class="flex items-center gap-1 text-[11px] text-tx2">
              <div class="w-[7px] h-[7px] rounded-full bg-pu2"></div>
              MMR Est.
            </div>
          </div>
        </div>
        <svg viewBox="0 0 520 140" class="w-full h-auto">
          <defs>
            <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#22C55E" stop-opacity=".2" />
              <stop offset="100%" stop-color="#22C55E" stop-opacity="0" />
            </linearGradient>
          </defs>
          <line x1="38" y1="18" x2="512" y2="18" stroke="rgba(255,255,255,.04)" stroke-width="1" />
          <line x1="38" y1="50" x2="512" y2="50" stroke="rgba(255,255,255,.04)" stroke-width="1" />
          <line x1="38" y1="82" x2="512" y2="82" stroke="rgba(255,255,255,.04)" stroke-width="1" />
          <line
            x1="38"
            y1="114"
            x2="512"
            y2="114"
            stroke="rgba(255,255,255,.04)"
            stroke-width="1"
          />
          <text x="0" y="21" fill="#4A5270" font-size="9">80%</text>
          <text x="0" y="53" fill="#4A5270" font-size="9">60%</text>
          <text x="0" y="85" fill="#4A5270" font-size="9">40%</text>
          <text x="0" y="117" fill="#4A5270" font-size="9">20%</text>
          <path
            d="M38,95 C78,88 118,80 158,73 C198,66 238,80 278,67 C318,54 358,46 398,37 C428,30 468,25 512,20"
            fill="none"
            stroke="#22C55E"
            stroke-width="2.2"
          />
          <path
            d="M38,95 C78,88 118,80 158,73 C198,66 238,80 278,67 C318,54 358,46 398,37 C428,30 468,25 512,20 L512,128 L38,128Z"
            fill="url(#wg)"
          />
          <path
            d="M38,104 C78,99 118,102 158,94 C198,86 238,100 278,90 C318,80 358,71 398,62 C428,55 468,50 512,44"
            fill="none"
            stroke="#A78BFA"
            stroke-width="1.8"
            stroke-dasharray="5,3"
          />
          <text x="38" y="138" fill="#4A5270" font-size="8.5" text-anchor="middle">Apr 13</text>
          <text x="158" y="138" fill="#4A5270" font-size="8.5" text-anchor="middle">Apr 20</text>
          <text x="278" y="138" fill="#4A5270" font-size="8.5" text-anchor="middle">Apr 27</text>
          <text x="398" y="138" fill="#4A5270" font-size="8.5" text-anchor="middle">May 4</text>
          <text x="512" y="138" fill="#4A5270" font-size="8.5" text-anchor="end">May 11</text>
        </svg>
      </div>

      <!-- AI COACH SUMMARY BOX -->
      <div
        class="bg-linear-to-r from-[rgba(123,92,240,0.14)] to-[rgba(56,189,248,0.05)] border border-[#7B5CF0]/30 rounded-xl p-4"
      >
        <div class="flex items-center gap-[11px] mb-[11px]">
          <div
            class="w-10 h-10 rounded-full bg-linear-to-br from-pu to-[#4f46e5] flex items-center justify-center text-[19px] border-2 border-pu2 shrink-0"
          >
            🤖
          </div>
          <div>
            <div class="text-[13px] font-bold">AI Coach Summary</div>
            <div class="text-[10px] text-tx2 mt-0.5">
              Based on your last 30 matches · Updated 2m ago
            </div>
          </div>
        </div>
        <div class="text-[12px] text-tx2 line-height-[1.75]">
          Your hook accuracy improved to <strong class="text-gr">38%</strong> this week — above
          average for your bracket. You're leaving ~15 CS per game in lane. Teams win
          <strong class="text-gr">72%</strong> of games where you secure Aegis. Prioritize Roshan control
          every game.
        </div>
        <div
          class="flex items-center gap-[14px] bg-black/20 rounded-lg p-[10px_13px] mt-3 border border-bd"
        >
          <div class="font-mono text-[30px] font-bold text-gr leading-none">7.8</div>
          <div>
            <div class="text-[11.5px] font-bold text-tx">Overall Rating</div>
            <div class="text-gd text-[13px] tracking-[2px] mt-0.5">★★★★☆</div>
          </div>
          <div class="ml-auto">
            <span class="card-lnk" onclick={() => gotoView('coach')}>Full analysis →</span>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL: RECENT MATCHES & HEROES -->
    <div class="flex flex-col gap-4">
      <div class="card">
        <div class="card-hd">
          <span class="card-ttl">Recent Matches</span>
          <span class="card-lnk" onclick={() => gotoView('matches')}>View all →</span>
        </div>
        <div class="flex flex-col gap-1.5">
          {#each MATCHES.slice(0, 5) as m}
            <div
              class="match-row border-l-[2.5px] {m.outcome === 'win'
                ? 'border-l-gr'
                : 'border-l-rd'}"
              onclick={() => openMatchDetail(m)}
            >
              <div
                class="w-[34px] h-[34px] rounded-[7px] flex items-center justify-center text-[17px] bg-s4 shrink-0"
              >
                {m.icon}
              </div>
              <div
                class="text-[12.5px] font-extrabold w-[38px] {m.outcome === 'win'
                  ? 'text-gr'
                  : 'text-rd'}"
              >
                {m.outcome === 'win' ? 'Win' : 'Loss'}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-[12.5px] font-bold truncate">{m.hero}</div>
                <div class="text-[10px] text-tx2 mt-0.5">{m.mode}</div>
              </div>
              <div class="text-[12px] text-tx2 font-mono font-medium w-[70px] text-center">
                {m.k}/{m.d}/{m.a}
              </div>
              <div class="text-[11px] text-tx3 w-[46px] text-right">{m.dur}</div>
              <div class="text-tx3 text-[14px] ml-1 transition-colors hover:text-pu2">›</div>
            </div>
          {/each}
        </div>
      </div>

      <div class="card">
        <div class="card-hd">
          <span class="card-ttl">Most Played Heroes</span>
          <span class="card-lnk" onclick={() => gotoView('heroes')}>View all →</span>
        </div>
        <div class="flex flex-col">
          {#each HEROES.slice(0, 5) as h}
            <div
              class="flex items-center gap-2.5 py-1.75 border-b border-bd last:border-b-0 cursor-pointer hover:pl-1 transition-all"
              onclick={() => gotoView('heroes')}
            >
              <div
                class="w-[28px] h-[28px] rounded-sm bg-s2 flex items-center justify-center text-[14px] shrink-0"
              >
                {h.icon}
              </div>
              <div class="text-[12.5px] font-medium flex-1 truncate">{h.name}</div>
              <div class="text-[11px] text-tx3 w-10 text-right">{h.matches}g</div>
              <span
                class="text-[11px] font-bold px-2 py-0.5 rounded-[10px] shrink-0 {h.winrate >= 60
                  ? 'bg-grb text-gr'
                  : h.winrate >= 50
                    ? 'bg-gdb text-gd'
                    : 'bg-rdb text-rd'}"
              >
                {h.winrate}%
              </span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
