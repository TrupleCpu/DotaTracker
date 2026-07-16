<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { getHero, getHeroImgUrl, getHeroByName } from '../utils/heroMap'
  import { uiStore } from '../stores/uiStore.svelte'
  import type { DraftState } from '../types'

  let draftData = $state<DraftState | null>(null)

  let suggestions = $state<Record<string, { heroName: string; reason: string; confidence: number }> | null>(null)
  let suggestError = $state<string | null>(null)
  let isAnalyzing = $state(false)
  let winProb = $state({ radiantProb: 50, direProb: 50 })
  let draftIdString = $state('')
  let playerTeam = $state('Radiant')
  let teamManuallySet = $state(false)
  let analyzeTimeout: ReturnType<typeof setTimeout> | null = null
  let engineReady = $state(false)
  let draftAnalyzerEnabled = $state(false)

  const POSITIONS = [
    { key: 'carry', label: 'Carry', icon: '⚔️' },
    { key: 'mid', label: 'Mid', icon: '🎯' },
    { key: 'offlane', label: 'Offlane', icon: '🛡️' },
    { key: 'softSupport', label: 'Soft Support', icon: '💜' },
    { key: 'hardSupport', label: 'Hard Support', icon: '💚' }
  ]

  function setTeam(team: string) {
    playerTeam = team
    teamManuallySet = true
  }

  async function analyzeDraft(radiantIds: number[], direIds: number[]) {
    if (!draftAnalyzerEnabled) return
    if (radiantIds.length === 0 && direIds.length === 0) return
    isAnalyzing = true
    try {
      const [suggestion, prob] = await Promise.all([
        window.api.analyzeDraftSuggestion(radiantIds, direIds, playerTeam),
        window.api.analyzeDraftWinProbability(radiantIds, direIds)
      ])
      if (suggestion.error) {
        suggestError = suggestion.error
        suggestions = null
      } else {
        suggestError = null
        suggestions = suggestion.suggestions || null
      }
      winProb = prob
    } catch (e) {
      console.error('Failed to analyze draft', e)
      suggestError = 'Failed to analyze draft'
    } finally {
      isAnalyzing = false
    }
  }

  function confidenceColor(c: number): string {
    if (c >= 75) return 'bg-grb text-gr'
    if (c >= 50) return 'bg-gdb text-gd'
    return 'bg-rdb text-rd'
  }

  function confidenceBarColor(c: number): string {
    if (c >= 75) return 'var(--color-gr)'
    if (c >= 50) return 'var(--color-gd)'
    return 'var(--color-rd)'
  }

  onMount(async () => {
    try {
      const config = await window.api.getConfig()
      draftAnalyzerEnabled = config.draftAnalyzerEnabled ?? false
    } catch {}

    window.api.onGsiStream((data: any) => {
      if (!teamManuallySet) {
        const team = data.player?.team
        if (team === 'Radiant' || team === 'Dire') {
          playerTeam = team
        }
      }
    })

    window.api.onDraftUpdate(async (data: any) => {
      if (!engineReady) engineReady = true
      draftData = data

      const radiantIds = data.Radiant.filter((h: any) => h !== null).map((h: any) => h.id)
      const direIds = data.Dire.filter((h: any) => h !== null).map((h: any) => h.id)
      const newDraftString = [...radiantIds, ...direIds].join(',')

      if (newDraftString !== draftIdString && newDraftString.length > 0) {
        draftIdString = newDraftString
        
        if (analyzeTimeout) {
          clearTimeout(analyzeTimeout)
        }
        
        // Wait 2.5 seconds after the latest update before calling the analyzer
        analyzeTimeout = setTimeout(() => {
          analyzeDraft(radiantIds, direIds)
        }, 2500)
      }
    })
  })

  onDestroy(() => {
    if (analyzeTimeout) {
      clearTimeout(analyzeTimeout)
    }
  })
</script>

<div class="flex-1 overflow-y-auto overflow-x-hidden p-4 select-none">
  {#if !draftAnalyzerEnabled}
    <div class="flex flex-col items-center justify-center h-full gap-4 max-w-sm mx-auto text-center">
      <div class="w-14 h-14 rounded-2xl bg-s2 border border-bd flex items-center justify-center">
        <span class="text-2xl">⚔️</span>
      </div>
      <div>
        <div class="text-base font-bold text-tx mb-1.5">AI-Powered Draft Analyzer</div>
        <div class="text-sm text-tx2 leading-relaxed">
          Get real-time hero pick suggestions for each position during the draft phase.
        </div>
      </div>
      <div class="bg-ywb/10 border border-yw/30 rounded-lg px-4 py-3 text-xs text-yw leading-relaxed">
        Still in <span class="font-bold">development mode</span> — may cause high CPU usage.
      </div>
      <button
        class="bg-pub border border-pu/40 text-tx px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-pu/30 hover:border-pu cursor-pointer shadow-sm"
        onclick={() => uiStore.gotoView('settings', 'sllm')}
      >
        Activate in Settings
      </button>
    </div>
  {:else if !engineReady}
    <div class="flex flex-col items-center justify-center h-full gap-3">
      <div class="w-8 h-8 border-2 border-pu/30 border-t-pu rounded-full animate-spin"></div>
      <div class="text-tx3 text-sm">Waiting for draft engine...</div>
    </div>
  {:else}
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="text-xs text-tx2">Team:</span>
        <div class="flex rounded-sm overflow-hidden border border-bd">
          <button
            class="text-xs font-bold px-2.5 py-1 transition-colors {playerTeam === 'Radiant'
              ? 'bg-grb text-gr'
              : 'bg-s3 text-tx3 hover:text-tx'}"
            onclick={() => setTeam('Radiant')}
          >
            Radiant
          </button>
          <button
            class="text-xs font-bold px-2.5 py-1 transition-colors {playerTeam === 'Dire'
              ? 'bg-rdb text-rd'
              : 'bg-s3 text-tx3 hover:text-tx'}"
            onclick={() => setTeam('Dire')}
          >
            Dire
          </button>
        </div>
        {#if !teamManuallySet}
          <span class="text-xxs text-tx3">(auto)</span>
        {/if}
      </div>
    </div>

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
            {#each draftData ? draftData[side as keyof DraftState] : [] as h}
              {#if h}
                {@const hero = getHero(h.id)}
                <div class="flex items-center gap-2.5 p-2 rounded-md border bg-s2 border-bd">
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
                    <div class="font-bold text-sm truncate text-tx">{h.name}</div>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span
                        class="text-xs font-bold px-1.5 py-0.5 rounded-sm {confidenceColor(
                          h.confidence * 100
                        )}"
                      >
                        {Math.round(h.confidence * 100)}%
                      </span>
                      <div class="flex-1 h-1 bg-s3 rounded-sm overflow-hidden max-w-[60px]">
                        <div
                          class="h-full rounded-sm"
                          style="width: {h.confidence * 100}%; background: {confidenceBarColor(
                            h.confidence * 100
                          )}"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              {:else}
                <div
                  class="flex items-center justify-center border border-dashed border-bd rounded-md p-3 text-tx3 text-xs h-[52px]"
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
        <div
          class="absolute left-0 top-0 h-full bg-gr rounded-l-sm transition-all duration-500"
          style="width: {winProb.radiantProb}%"
        ></div>
        <div
          class="absolute right-0 top-0 h-full bg-rd rounded-r-sm transition-all duration-500"
          style="width: {winProb.direProb}%"
        ></div>
        <div class="absolute left-1/2 top-0 h-full w-0.5 bg-bg -translate-x-1/2 z-10"></div>
      </div>
      <div class="flex justify-between text-xs font-bold">
        <span class="text-gr">Radiant {winProb.radiantProb.toFixed(1)}%</span>
        <span class="text-tx2">Win Probability</span>
        <span class="text-rd">{winProb.direProb.toFixed(1)}% Dire</span>
      </div>
    </div>

    <div class="bg-s1 border border-bd rounded-lg p-[14px]">
      <div class="text-sm font-bold text-tx2 mb-3">Suggested Picks</div>
      {#if isAnalyzing}
        <div class="text-tx3 text-sm">Analyzing draft...</div>
      {:else if suggestError}
        <div class="text-sm">
          <div class="text-tx3 mb-2">{suggestError}</div>
          <div class="text-xs text-tx3">
            Configure
              <button
                class="text-pu2 hover:underline font-semibold"
                onclick={() => uiStore.gotoView('settings', 'sllm')}
              >AI Coach in Settings</button>
              for draft suggestions.
          </div>
        </div>
      {:else if suggestions}
        <div class="text-xs text-tx3 mb-3">
          Best pick for
          <span class="font-bold {playerTeam === 'Radiant' ? 'text-gr' : 'text-rd'}">{playerTeam}</span>
          per position:
        </div>
        <div class="flex flex-col gap-2">
          {#each POSITIONS as pos}
            {@const s = suggestions[pos.key]}
            {@const h = s?.heroName ? getHeroByName(s.heroName) : null}
            {#if s?.heroName}
              <div class="flex items-center gap-3 bg-s2 p-2.5 rounded-md border border-bd">
                <div class="w-9 h-9 rounded-sm bg-s3 flex items-center justify-center shrink-0 overflow-hidden">
                  {#if h?.icon}
                    <img
                      src={getHeroImgUrl(h.icon)}
                      alt={s.heroName}
                      class="w-full h-full object-cover"
                    />
                  {:else}
                    <span class="text-sm">{pos.icon}</span>
                  {/if}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="text-xxs font-bold text-tx3 uppercase tracking-wider shrink-0">{pos.label}</span>
                      <span class="font-bold text-sm text-tx truncate">{s.heroName}</span>
                    </div>
                    <span
                      class="text-xs font-bold px-1.5 py-0.5 rounded-sm shrink-0 {confidenceColor(
                        s.confidence
                      )}"
                    >
                      {Math.round(s.confidence)}%
                    </span>
                  </div>
                  <div class="flex-1 h-1 bg-s3 rounded-sm overflow-hidden max-w-[120px] mt-1">
                    <div
                      class="h-full rounded-sm"
                      style="width: {s.confidence}%; background: {confidenceBarColor(s.confidence)}"
                    ></div>
                  </div>
                  <div class="text-xs text-tx3 leading-snug mt-1">{s.reason}</div>
                </div>
              </div>
            {:else}
              <div class="flex items-center gap-3 bg-s2 p-2.5 rounded-md border border-dashed border-bd opacity-50">
                <div class="w-9 h-9 rounded-sm bg-s3 flex items-center justify-center shrink-0">
                  <span class="text-sm">{pos.icon}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <span class="text-xxs font-bold text-tx3 uppercase tracking-wider">{pos.label}</span>
                  <div class="text-xs text-tx3 mt-0.5">No suggestion available</div>
                </div>
              </div>
            {/if}
          {/each}
        </div>
      {:else}
        <div class="text-tx3 text-sm">Waiting for draft to begin...</div>
      {/if}
    </div>
  {/if}
</div>
