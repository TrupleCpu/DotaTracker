<script lang="ts">
  let activeTab = $state('co-overview')
</script>

<div class="flex-1 overflow-y-auto p-4 select-none">
  <!-- TABNAV -->
  <div class="flex gap-0.5 bg-s2 rounded-lg p-0.75 w-fit mb-4">
    <button class="px-[13px] py-1.25 rounded-md border-none bg-transparent text-tx2 text-[12px] font-medium cursor-pointer transition-all {activeTab === 'co-overview' ? 'bg-s4 text-tx' : 'hover:text-tx'}" onclick={() => activeTab = 'co-overview'}>Overview</button>
    <button class="px-[13px] py-1.25 rounded-md border-none bg-transparent text-tx2 text-[12px] font-medium cursor-pointer transition-all {activeTab === 'co-mistakes' ? 'bg-s4 text-tx' : 'hover:text-tx'}" onclick={() => activeTab = 'co-mistakes'}>Mistakes</button>
    <button class="px-[13px] py-1.25 rounded-md border-none bg-transparent text-tx2 text-[12px] font-medium cursor-pointer transition-all {activeTab === 'co-strengths' ? 'bg-s4 text-tx' : 'hover:text-tx'}" onclick={() => activeTab = 'co-strengths'}>Strengths</button>
    <button class="px-[13px] py-1.25 rounded-md border-none bg-transparent text-tx2 text-[12px] font-medium cursor-pointer transition-all {activeTab === 'co-goals' ? 'bg-s4 text-tx' : 'hover:text-tx'}" onclick={() => activeTab = 'co-goals'}>Goals</button>
  </div>

  {#if activeTab === 'co-overview'}
    <div>
      <div class="bg-linear-to-r from-[rgba(123,92,240,0.14)] to-[rgba(56,189,248,0.05)] border border-[#7B5CF0]/30 rounded-xl p-4 mb-4">
        <div class="flex items-center gap-[11px] mb-[11px]">
          <div class="w-10 h-10 rounded-full bg-linear-to-br from-pu to-[#4f46e5] flex items-center justify-center text-[19px] border-2 border-pu2 shrink-0">🤖</div>
          <div>
            <div class="text-[13px] font-bold">AI Coach Summary</div>
            <div class="text-[10px] text-tx2 mt-0.5">Based on your last 30 matches · Updated 2m ago</div>
          </div>
        </div>
        <div class="text-[12px] text-tx2 line-height-[1.75]">
          You played well this period. Teamfighting presence and objective control were strong. Focus on <strong class="text-gd">early-game survival</strong> and <strong class="text-bl">farming efficiency</strong> — leaving ~15–20 CS per game. Hook accuracy at <strong class="text-gr">38%</strong> this week, above average for Archon. Teams win <strong class="text-gr">72%</strong> of games where you secure Aegis.
        </div>
        <div class="flex items-center gap-[14px] bg-black/20 rounded-lg p-[10px_13px] mt-3 border border-bd">
          <div class="font-mono text-[30px] font-bold text-gr leading-none">7.8</div>
          <div>
            <div class="text-[11.5px] font-bold text-tx">Overall Rating</div>
            <div class="text-gd text-[13px] tracking-[2px] mt-0.5">★★★★☆</div>
            <div class="text-[11px] text-tx2 mt-0.75">Good game! Keep pushing toward Legend.</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-2.5 mb-4">
        <div class="bg-s1 border border-bd rounded-lg p-[12px_13px]">
          <div class="text-[10px] font-bold uppercase tracking-[0.7px] mb-1.25 flex items-center gap-1.25 text-rd">Top Mistake</div>
          <div class="text-[11.5px] text-tx2 line-height-[1.6]"><strong>Early Deaths</strong> — Died before 10 min in 60% of games. Play safer in lane, respect cooldowns.</div>
        </div>
        <div class="bg-s1 border border-bd rounded-lg p-[12px_13px]">
          <div class="text-[10px] font-bold uppercase tracking-[0.7px] mb-1.25 flex items-center gap-1.25 text-gr">Top Strength</div>
          <div class="text-[11.5px] text-tx2 line-height-[1.6]"><strong>Team Fighting</strong> — Active in most fights. Engagement timing strong in late game.</div>
        </div>
        <div class="bg-s1 border border-bd rounded-lg p-[12px_13px]">
          <div class="text-[10px] font-bold uppercase tracking-[0.7px] mb-1.25 flex items-center gap-1.25 text-pu2">Focus Area</div>
          <div class="text-[11.5px] text-tx2 line-height-[1.6]"><strong>Farming Patterns</strong> — GPM drops against aggressive lanes. Improve safe farm when behind.</div>
        </div>
      </div>

      <div class="card">
        <div class="card-hd"><span class="card-ttl">Focus Areas — Next 10 Games</span></div>
        <div class="flex flex-col">
          <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
            <div class="w-[22px] h-[22px] rounded-full bg-pub text-pu2 flex items-center justify-center text-[11px] font-extrabold shrink-0">1</div>
            <div>
              <div class="text-[12.5px] font-bold mb-0.75">Reduce early deaths</div>
              <div class="text-[11.5px] text-tx2 line-height-[1.6]">Target: 0 deaths before 5 min in 7 of 10 games. Use TP scrolls proactively to escape bad lanes.</div>
            </div>
          </div>
          <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
            <div class="w-[22px] h-[22px] rounded-full bg-pub text-pu2 flex items-center justify-center text-[11px] font-extrabold shrink-0">2</div>
            <div>
              <div class="text-[12.5px] font-bold mb-0.75">Improve hook accuracy</div>
              <div class="text-[11.5px] text-tx2 line-height-[1.6]">Current: 38%. Target: 45%. Hook near trees, predict blink timings during chases.</div>
            </div>
          </div>
          <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
            <div class="w-[22px] h-[22px] rounded-full bg-pub text-pu2 flex items-center justify-center text-[11px] font-extrabold shrink-0">3</div>
            <div>
              <div class="text-[12.5px] font-bold mb-0.75">Secure Roshan control</div>
              <div class="text-[11.5px] text-tx2 line-height-[1.6]">Contest every Roshan after 20 min. Win rate with Aegis is 72% — your highest-impact habit.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {:else if activeTab === 'co-mistakes'}
    <div class="card">
      <div class="card-hd"><span class="card-ttl">Recurring Mistakes</span></div>
      <div class="flex flex-col">
        <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
          <div class="text-[17px] shrink-0 mt-0.5">🔴</div>
          <div>
            <div class="text-[12.5px] font-bold mb-0.75 text-rd">Overextension in lane</div>
            <div class="text-[11.5px] text-tx2 line-height-[1.6]">Dying in enemy territory before 5 min in 60% of games.</div>
          </div>
        </div>
        <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
          <div class="text-[17px] shrink-0 mt-0.5">🔴</div>
          <div>
            <div class="text-[12.5px] font-bold mb-0.75 text-rd">Late item purchases</div>
            <div class="text-[11.5px] text-tx2 line-height-[1.6]">Blink Dagger purchased avg. 2.5 min late — delays your entire kill window.</div>
          </div>
        </div>
        <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
          <div class="text-[17px] shrink-0 mt-0.5">🟡</div>
          <div>
            <div class="text-[12.5px] font-bold mb-0.75 text-gd">Low rune control</div>
            <div class="text-[11.5px] text-tx2 line-height-[1.6]">Contesting bounty runes in only 40% of games. Missing ~200g per game.</div>
          </div>
        </div>
        <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
          <div class="text-[17px] shrink-0 mt-0.5">🟡</div>
          <div>
            <div class="text-[12.5px] font-bold mb-0.75 text-gd">TP Scroll neglect</div>
            <div class="text-[11.5px] text-tx2 line-height-[1.6]">Failed to defend towers with TPs in 5 of last 10 games, losing towers unnecessarily.</div>
          </div>
        </div>
      </div>
    </div>
  {:else if activeTab === 'co-strengths'}
    <div class="card">
      <div class="card-hd"><span class="card-ttl">Your Strengths</span></div>
      <div class="flex flex-col">
        <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
          <div class="text-[17px] shrink-0 mt-0.5">🟢</div>
          <div>
            <div class="text-[12.5px] font-bold mb-0.75 text-gr">High kill participation</div>
            <div class="text-[11.5px] text-tx2 line-height-[1.6]">42% avg — 10 pts above bracket average. You contribute actively to every fight.</div>
          </div>
        </div>
        <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
          <div class="text-[17px] shrink-0 mt-0.5">🟢</div>
          <div>
            <div class="text-[12.5px] font-bold mb-0.75 text-gr">Roshan control</div>
            <div class="text-[11.5px] text-tx2 line-height-[1.6]">Initiating or securing Roshan in 68% of eligible games — top 10% at your MMR.</div>
          </div>
        </div>
        <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
          <div class="text-[17px] shrink-0 mt-0.5">🟢</div>
          <div>
            <div class="text-[12.5px] font-bold mb-0.75 text-gr">Improving hook accuracy</div>
            <div class="text-[11.5px] text-tx2 line-height-[1.6]">Up from 30% → 38% in last 15 games. Trending strongly toward 45% target.</div>
          </div>
        </div>
        <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
          <div class="text-[17px] shrink-0 mt-0.5">🔵</div>
          <div>
            <div class="text-[12.5px] font-bold mb-0.75 text-bl">Game sense</div>
            <div class="text-[11.5px] text-tx2 line-height-[1.6]">Correctly identified kill windows in 8 of last 10 games. Above average for Archon.</div>
          </div>
        </div>
      </div>
    </div>
  {:else if activeTab === 'co-goals'}
    <div class="card">
      <div class="card-hd"><span class="card-ttl">Active Goals</span></div>
      <div class="flex flex-col">
        <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
          <div class="w-[22px] h-[22px] rounded-full bg-pub text-pu2 flex items-center justify-center text-[10px] font-extrabold shrink-0">G</div>
          <div class="flex-1">
            <div class="text-[12.5px] font-bold mb-0.75">Reach Legend rank</div>
            <div class="text-[11.5px] text-tx2 mb-1.75">2,450 → 3,000 MMR · ~25 games at current rate</div>
            <div class="h-1.5 w-full bg-s3 rounded-sm overflow-hidden"><div class="h-full bg-pu2 rounded-sm" style="width: 49%"></div></div>
            <div class="text-[10px] text-tx3 mt-0.75">49% — 2,450 / 3,000 MMR</div>
          </div>
        </div>
        <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
          <div class="w-[22px] h-[22px] rounded-full bg-grb text-gr flex items-center justify-center text-[11px] font-extrabold shrink-0">✓</div>
          <div class="flex-1">
            <div class="text-[12.5px] font-bold mb-0.75">60% win rate on Pudge</div>
            <div class="text-[11.5px] text-tx2 mb-1.75">Goal achieved — 66.7% over 12 games. Sustain this.</div>
            <div class="h-1.5 w-full bg-s3 rounded-sm overflow-hidden"><div class="h-full bg-gr rounded-sm" style="width: 100%"></div></div>
            <div class="text-[10px] text-gr mt-0.75">✓ 66.7% WR — Goal reached!</div>
          </div>
        </div>
        <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
          <div class="w-[22px] h-[22px] rounded-full bg-gdb text-gd flex items-center justify-center text-[10px] font-extrabold shrink-0">G</div>
          <div class="flex-1">
            <div class="text-[12.5px] font-bold mb-0.75">45% hook accuracy</div>
            <div class="text-[11.5px] text-tx2 mb-1.75">Current: 38% · Target: 45% · +7% remaining</div>
            <div class="h-1.5 w-full bg-s3 rounded-sm overflow-hidden"><div class="h-full bg-gd rounded-sm" style="width: 84%"></div></div>
            <div class="text-[10px] text-tx3 mt-0.75">84% — 38% / 45%</div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
