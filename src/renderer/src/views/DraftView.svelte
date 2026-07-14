<script lang="ts">
  import { onMount } from 'svelte'
  import { getHero, getHeroImgUrl } from '../utils/heroMap'
  import type { DraftState } from '../types'

  let draftData = $state<DraftState | null>(null)
  
  // New Analysis State
  let selectedHeroId = $state<number | null>(null)
  let counters = $state<any[]>([])
  let laneOutcomes = $state<any[]>([])
  let isAnalyzing = $state(false)
  let winProb = $state({ radiantProb: 50, direProb: 50 })
  let draftIdString = $state("")

  async function analyzeHero(heroId: number) {
    if (heroId === selectedHeroId) return
    selectedHeroId = heroId
    isAnalyzing = true
    try {
      const result = await window.api.analyzeHeroMatchups(heroId)
      counters = result.counters || []
      laneOutcomes = result.laneOutcomes || []
    } catch (e) {
      console.error("Failed to analyze draft", e)
    } finally {
      isAnalyzing = false
    }
  }

  onMount(() => {
    window.api.onDraftUpdate(async (data: any) => {
      draftData = data

      // Auto-select the first hero drafted if we haven't selected anything yet
      if (!selectedHeroId) {
        const allDrafted = [...data.Radiant, ...data.Dire].filter(h => h !== null)
        if (allDrafted.length > 0) {
          analyzeHero(allDrafted[0].id)
        }
      }

      // Calculate Draft Advantage when heroes change
      const radiantIds = data.Radiant.filter(h => h !== null).map(h => h.id)
      const direIds = data.Dire.filter(h => h !== null).map(h => h.id)
      const newDraftString = [...radiantIds, ...direIds].join(',')
      
      if (newDraftString !== draftIdString && newDraftString.length > 0) {
        draftIdString = newDraftString
        try {
           const prob = await window.api.analyzeDraftWinProbability(radiantIds, direIds)
           winProb = prob
        } catch (e) {
           console.error("Failed to analyze draft probability", e)
        }
      }
    })
  })

  function confidenceColor(c: number): string {
    if (c >= 0.75) return 'bg-grb text-gr'
    if (c >= 0.55) return 'bg-gdb text-gd'
    return 'bg-rdb text-rd'
  }

  function confidenceBarColor(c: number): string {
    if (c >= 0.75) return 'var(--color-gr)'
    if (c >= 0.55) return 'var(--color-gd)'
    return 'var(--color-rd)'
  }
</script>

<div class="flex-1 overflow-y-auto p-4 select-none">
  {#if !draftData}
    <div class="flex items-center justify-center h-full text-tx3 text-sm">
      Waiting for draft data...
    </div>
  {:else}
    <div class="grid grid-cols-2 gap-4 mb-4">
      {#each ['Radiant', 'Dire'] as side}
        <div class="bg-s1 border border-bd rounded-lg p-[14px]">
          <div
            class="text-base font-extrabold mb-[11px] flex items-center gap-1.75 {side === 'Radiant'
              ? 'text-gr'
              : 'text-rd'}"
          >
            ⬛ {side}
          </div>
          <div class="flex flex-col gap-1.5">
            {#each draftData[side as keyof DraftState] as h}
              {#if h}
                {@const hero = getHero(h.id)}
                <button
                  class="flex items-center gap-2.5 p-2 rounded-md border transition-all cursor-pointer w-full text-left {selectedHeroId === hero.id ? 'bg-s3 border-pu shadow-[0_0_8px_rgba(124,92,191,0.4)]' : 'bg-s2 border-bd hover:border-bd2'}"
                  onclick={() => analyzeHero(hero.id)}
                >
                  <div
                    class="w-[34px] h-[34px] rounded-sm bg-s3 flex items-center justify-center text-xl shrink-0 overflow-hidden"
                  >
                    {#if hero?.icon}
                      <img
                        src={getHeroImgUrl(hero.icon)}
                        alt={h.name}
                        class="w-full h-full object-cover"
                      />
                    {:else}
                      <span class="text-xs text-tx3">{h.name[0]}</span>
                    {/if}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="font-bold text-sm truncate {selectedHeroId === hero.id ? 'text-pu2' : 'text-tx'}">{h.name}</div>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span
                        class="text-xs font-bold px-1.5 py-0.5 rounded-sm {confidenceColor(
                          h.confidence
                        )}"
                      >
                        {Math.round(h.confidence * 100)}%
                      </span>
                      <div class="flex-1 h-1 bg-s3 rounded-sm overflow-hidden max-w-[60px]">
                        <div
                          class="h-full rounded-sm"
                          style="width: {h.confidence * 100}%; background: {confidenceBarColor(
                            h.confidence
                          )}"
                        ></div>
                      </div>
                    </div>
                  </div>
                </button>
              {:else}
                <div
                  class="flex items-center justify-center border border-dashed border-bd rounded-md p-3 text-tx3 text-xs cursor-pointer hover:border-pu hover:text-pu2 transition-colors h-[52px]"
                >
                  + Pick hero
                </div>
              {/if}
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <div class="bg-s1 border border-bd rounded-lg p-[14px_16px] mb-4">
      <div class="text-sm font-bold text-tx2 mb-1">Draft Advantage Analysis</div>
      <div class="h-2.25 bg-s2 rounded-sm overflow-hidden relative my-2">
        <div class="absolute left-0 top-0 h-full bg-gr rounded-l-sm transition-all duration-500" style="width: {winProb.radiantProb}%"></div>
        <div class="absolute right-0 top-0 h-full bg-rd rounded-r-sm transition-all duration-500" style="width: {winProb.direProb}%"></div>
        <div class="absolute left-1/2 top-0 h-full w-0.5 bg-bg -translate-x-1/2 z-10"></div>
      </div>
      <div class="flex justify-between text-xs font-bold">
        <span class="text-gr">Radiant {winProb.radiantProb.toFixed(1)}%</span>
        <span class="text-tx2">Win Probability</span>
        <span class="text-rd">{winProb.direProb.toFixed(1)}% Dire</span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="card">
        <div class="card-hd"><span class="card-ttl">Top Counters for Selected Hero</span></div>
        <div class="flex flex-col">
          {#if isAnalyzing}
            <div class="p-4 text-tx3 text-sm">Analyzing matchups...</div>
          {:else if counters.length > 0}
            {#each counters as counter}
              {@const hero = getHero(counter.heroId2)}
              {#if hero}
                <div class="flex items-center gap-3 py-2.5 border-b border-bd last:border-b-0 px-[14px]">
                  <img src={getHeroImgUrl(hero.icon)} class="w-10 h-10 rounded-sm object-cover" alt={hero.name} />
                  <div class="flex-1">
                    <div class="font-bold text-tx">{hero.name}</div>
                    <div class="text-xs text-gr">{((1 - counter.winsAverage) * 100).toFixed(1)}% Win Rate Advantage</div>
                  </div>
                </div>
              {/if}
            {/each}
          {:else}
            <div class="p-4 text-tx3 text-sm">Waiting for draft to begin...</div>
          {/if}
        </div>
      </div>
      
      <div class="card">
        <div class="card-hd"><span class="card-ttl">Lane Outcomes (Selected Hero)</span></div>
        <div class="flex flex-col p-4 text-sm text-tx2">
           <div class="mb-3 text-tx">General expected lane performance based on historic data:</div>
           {#if isAnalyzing}
             <div class="text-tx3 text-sm">Analyzing lanes...</div>
           {:else if laneOutcomes.length > 0}
             <div class="flex flex-col gap-2">
               {#each laneOutcomes.slice(0, 3) as outcome}
                 {@const enemyHero = getHero(outcome.heroId2)}
                 {#if enemyHero}
                   <div class="flex justify-between items-center bg-s2 p-2 rounded-md border border-bd">
                     <div class="flex items-center gap-2">
                       <img src={getHeroImgUrl(enemyHero.icon)} class="w-7 h-7 rounded-sm object-cover" alt={enemyHero.name} />
                       <div class="flex flex-col">
                         <span class="font-bold text-tx text-xs">{enemyHero.name}</span>
                         <span class="text-[10px] text-tx3 uppercase tracking-wide">
                           {outcome.position === 'POSITION_1' ? 'Safe Lane' : 
                            outcome.position === 'POSITION_2' ? 'Mid Lane' : 
                            outcome.position === 'POSITION_3' ? 'Offlane' : 
                            outcome.position === 'POSITION_4' ? 'Soft Sup' : 
                            outcome.position === 'POSITION_5' ? 'Hard Sup' : outcome.position}
                         </span>
                       </div>
                     </div>
                     <span class="text-xs font-bold px-1.5 py-0.5 rounded-sm {(outcome.winCount / outcome.matchCount) > 0.5 ? 'bg-grb text-gr' : 'bg-rdb text-rd'}">
                       {((outcome.winCount / outcome.matchCount) * 100).toFixed(1)}% WR
                     </span>
                   </div>
                 {/if}
               {/each}
             </div>
           {:else}
             <div class="text-tx3 text-sm">No lane data available.</div>
           {/if}
        </div>
      </div>
    </div>
  {/if}
</div>
