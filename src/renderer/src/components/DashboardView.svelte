<script lang="ts">
  import { HEROES, MATCHES, type MockMatch } from '../utils/mockData'

  // Expanding the assumed data for the detailed view, or using placeholders
  // I will add some example properties for the detailed view
  interface ExpandedMockMatch extends MockMatch {
    roleIcon?: string // URL to role icon (sword/shield)
    mmrChange?: number // +X or -X
    impactValue?: number // 0-100 percentage
    rankBadge?: string // URL to rank badge (e.g., SeasonalRank3-3.png)
    partyCount?: number // 1, 2, 3
    timeAgo?: string // e.g., "3 wk. ago", "1 mo. ago"
  }

  // Slice and augment data for display (for generation only)
  let detailedMatches = $state(
    MATCHES.slice(0, 10).map((m: MockMatch, i) => {
      let outcomeText = m.outcome === 'win' ? 'W' : 'L'
      let outcomeTextLower = m.outcome === 'win' ? 'w' : 'l'
      return {
        ...m,
        roleIcon:
          'https://static.wikia.nocookie.net/dota2_gamepedia/images/4/47/Hero_Role_Carry_icon.png', // Assume Carry for all carries
        mmrChange: m.outcome === 'win' ? i * 5 + 10 : -(i * 3 + 5),
        impactValue: m.outcome === 'win' ? 85 : 45, // Example impact value
        rankBadge:
          'https://static.wikia.nocookie.net/dota2_gamepedia/images/6/6b/SeasonalRank3-3.png', // Use Archon 3 for all
        partyCount: (i % 3) + 1,
        timeAgo: `${(i % 4) + 1} wk. ago`,
        previousOutcome: outcomeTextLower // Just for W/L and L/W example
      }
    })
  )

  interface Props {
    openMatchDetail: (match: MockMatch) => void
    gotoView: (view: string) => void
  }
  let { openMatchDetail, gotoView }: Props = $props()
</script>

<div class="flex-1 overflow-y-auto p-4 select-none">
  <!-- KPI ROWS -->
  <div class="flex flex-col gap-4 mb-4">
    <!-- ROW 1: Matches & Win Rate -->
    <div class="grid grid-cols-2 gap-4">
      <!-- Matches Card -->
      <div class="card p-4 flex flex-col justify-center gap-3">
        <div class="flex justify-between items-baseline">
          <div class="text-[17px]">
            <span class="text-[#EAB308] font-bold">2,572</span>
            <span class="text-tx font-semibold ml-1">Matches</span>
          </div>
          <div class="text-[11.5px] text-tx2">First Match: Apr 19, 2019</div>
        </div>
        <div class="flex gap-[3px] h-[8px] w-full">
          {#each Array(24) as _}
            <div class="flex-1 bg-[#EAB308] rounded-[1px]"></div>
          {/each}
        </div>
      </div>

      <!-- Win Rate Card -->
      <div class="card p-4 flex flex-col justify-center gap-3">
        <div class="flex justify-between items-baseline">
          <div class="text-[17px]">
            <span class="text-gr font-bold">51.44%</span>
            <span class="text-tx font-semibold ml-1">Win Rate</span>
          </div>
          <div class="text-[12.5px]">
            <span class="text-gr">1,323</span>
            <span class="text-tx2 mx-1">-</span>
            <span class="text-rd">1,249</span>
          </div>
        </div>
        <div class="flex h-[8px] w-full bg-black/40 rounded-sm overflow-hidden gap-[2px]">
          <div class="bg-gr h-full" style="width: 51.44%"></div>
          <div class="bg-[#333] h-full flex-1"></div>
        </div>
      </div>
    </div>

    <!-- ROW 2: KDA, GPM & Rank -->
    <div class="grid grid-cols-3 gap-4">
      <!-- KDA Card -->
      <div class="card p-4 flex flex-col justify-center gap-2.5">
        <div class="flex justify-between items-baseline">
          <div class="text-[15px]">
            <span class="text-pu2 font-bold">3.45</span>
            <span class="text-tx2 text-[13px] ml-1">KDA Ratio</span>
          </div>
          <div class="text-[12px] font-mono text-tx2">
            11.2 <span class="text-rd mx-0.5">/ 4.1 /</span> 14.3
          </div>
        </div>
        <div class="flex h-[6px] w-full bg-black/40 rounded-sm overflow-hidden gap-[1px]">
          <div class="bg-gr h-full" style="width: 38%"></div>
          <div class="bg-rd h-full" style="width: 14%"></div>
          <div class="bg-bl h-full flex-1"></div>
        </div>
      </div>

      <!-- GPM Card -->
      <div class="card p-4 flex flex-col justify-center gap-2.5">
        <div class="flex justify-between items-baseline">
          <div class="text-[15px]">
            <span class="text-gd font-bold">542</span>
            <span class="text-tx2 text-[13px] ml-1">Avg GPM</span>
          </div>
          <div class="text-[12px] font-mono text-tx2">
            <span class="text-bl">590</span> XPM
          </div>
        </div>
        <div class="flex h-[6px] w-full bg-black/40 rounded-sm overflow-hidden gap-[1px]">
          <div class="bg-gd h-full" style="width: 48%"></div>
          <div class="bg-bl h-full flex-1"></div>
        </div>
      </div>

      <!-- Current Rank Image Card -->
      <div class="card flex items-center justify-center overflow-hidden p-1.5 h-full min-h-[70px]">
        <img
          src="https://static.wikia.nocookie.net/dota2_gamepedia/images/6/6b/SeasonalRank3-3.png"
          alt="Archon 3 Badge"
          class="h-[65px] object-contain drop-shadow-xl"
        />
      </div>
    </div>
  </div>

  <!-- MAIN DASHBOARD GRID -->
  <div class="grid grid-cols-[3fr_2fr] gap-4">
    <!-- LEFT PANEL: TRENDS & COACH (updated with new detailed view) -->
    <div class="flex flex-col gap-4">
      <!-- DETAILED MATCH HISTORY CARD (Replaces Trend Graph) -->
      <div class="card overflow-hidden">
        <div class="card-hd">
          <span class="card-ttl">Detailed Match History</span>
          <span class="card-lnk" onclick={() => gotoView('matches')}>View all →</span>
        </div>
        <div class="flex flex-col">
          {#each detailedMatches as m}
            <div
              class="flex items-center gap-4 py-2 px-3 border-b border-bd last:border-b-0 cursor-pointer hover:bg-black/10 transition-colors"
              onclick={() => openMatchDetail(m)}
            >
              <!-- 1. Hero Portrait: Large rectangular -->
              <div
                class="w-[55px] h-[31px] rounded-[4px] flex items-center justify-center text-[22px] bg-s4 shrink-0 overflow-hidden"
              >
                {m.icon}
                <!-- Use simplified icon for portrait for now -->
                <!-- <img src={m.portraitUrl} alt={m.hero} class="w-full h-full object-cover" /> -->
              </div>

              <!-- 2. Role Icon: Sword/Shield placeholder -->
              <div class="w-[24px] h-[24px] shrink-0 flex items-center justify-center text-[18px]">
                ⚔️
                <!-- <img src={m.roleIcon} alt="Role" class="w-full h-full object-contain" /> -->
              </div>

              <!-- 3. Outcome Bubbles & Text: W L, Arrows, Mode -->
              <div class="flex-1 flex flex-col min-w-0">
                <div class="flex items-center gap-1.5">
                  <div
                    class="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-extrabold {m.outcome ===
                    'win'
                      ? 'bg-gr text-black'
                      : 'bg-rd text-black'}"
                  >
                    {m.outcome === 'win' ? 'W' : 'L'}
                  </div>
                  <div
                    class="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-extrabold {m.previousOutcome ===
                    'win'
                      ? 'bg-grb text-gr'
                      : 'bg-rdb text-rd'}"
                  >
                    {m.previousOutcome === 'win' ? 'W' : 'L'}
                  </div>
                  <!-- Arrow logic can be added here -->
                  <div class="flex flex-col text-[10px] text-tx2 font-bold uppercase truncate">
                    {m.mode}
                  </div>
                </div>
              </div>

              <!-- 4. KDA Text: Centered -->
              <div class="text-[12px] text-tx2 font-mono font-medium w-[80px] text-center shrink-0">
                {m.k} / {m.d} / {m.a}
              </div>

              <!-- 5. MMR Change: +/- -->
              <div
                class="text-[12px] font-bold w-[40px] text-right shrink-0 {m.mmrChange >= 0
                  ? 'text-gr'
                  : 'text-rd'}"
              >
                {m.mmrChange >= 0 ? '+' : ''}{m.mmrChange}
              </div>

              <!-- 6. Impact Bar: performance comparison -->
              <div class="w-[100px] h-[6px] rounded-[3px] bg-black/40 overflow-hidden shrink-0">
                <div
                  class="h-full {m.impactValue >= 60 ? 'bg-gr' : 'bg-rd'}"
                  style="width: {m.impactValue}%"
                ></div>
              </div>

              <!-- 7. Match Details (Party, Rank): icons -->
              <div class="flex items-center gap-1 shrink-0">
                <div
                  class="w-[16px] h-[16px] shrink-0 flex items-center justify-center text-[11px]"
                >
                  👤
                </div>
                <div class="text-[11px] text-tx2 w-[16px] text-center shrink-0">
                  {m.partyCount}
                </div>
                <div
                  class="w-[20px] h-[20px] rounded-full bg-s3 flex items-center justify-center shrink-0 overflow-hidden"
                >
                  🏆 <!-- Rank placeholder -->
                  <!-- <img src={m.rankBadge} alt="Rank" class="w-full h-full object-contain drop-shadow-sm" /> -->
                </div>
              </div>

              <!-- 8. Time/Duration: stacked text -->
              <div class="text-tx3 text-right flex-col w-[80px] shrink-0 ml-auto">
                <div class="text-[11.5px] font-medium leading-tight">{m.dur}</div>
                <div class="text-[10px] text-tx2 leading-tight uppercase font-medium">
                  {m.timeAgo}
                </div>
              </div>

              <!-- View Match details chevron: hover state color change -->
              <div class="text-tx3 text-[16px] ml-1 transition-colors hover:text-pu2 shrink-0">
                ›
              </div>
            </div>
          {/each}
        </div>
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

    <!-- RIGHT PANEL: RECENT MATCHES & HEROES (Icons enlarged) -->
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
              <!-- Enlarged Icon (was 34x34) -->
              <div
                class="w-[44px] h-[44px] rounded-[7px] flex items-center justify-center text-[20px] bg-s4 shrink-0"
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
                <div class="text-[10px] text-tx2 mt-0.5 uppercase font-medium">{m.mode}</div>
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
              <!-- Enlarged Icon (was 28x28) -->
              <div
                class="w-[40px] h-[40px] rounded-sm bg-s2 flex items-center justify-center text-[18px] shrink-0"
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
