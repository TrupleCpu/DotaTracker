<script lang="ts">
  import { onMount } from 'svelte'
  import { getHero, getHeroImgUrl } from '../utils/heroMap'
  import type { DraftState } from '../types'

  let draftData = $state<DraftState | null>(null)

  onMount(() => {
    window.api.onDraftUpdate((data: any) => {
      draftData = data
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
                <div
                  class="flex items-center gap-2.5 p-2 bg-s2 rounded-md border border-bd hover:border-bd2 transition-colors"
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
                    <div class="font-bold text-sm truncate">{h.name}</div>
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
                </div>
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
        <div class="absolute left-0 top-0 h-full bg-gr rounded-l-sm" style="width: 58%"></div>
        <div class="absolute right-0 top-0 h-full bg-rd rounded-r-sm" style="width: 42%"></div>
        <div class="absolute left-1/2 top-0 h-full w-0.5 bg-bg -translate-x-1/2"></div>
      </div>
      <div class="flex justify-between text-xs font-bold">
        <span class="text-gr">Radiant 58%</span>
        <span class="text-tx2">Win Probability</span>
        <span class="text-rd">42% Dire</span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="card">
        <div class="card-hd"><span class="card-ttl">Radiant Strengths</span></div>
        <div class="flex flex-col">
          {#each [{ ico: '🟢', title: 'Strong teamfight', desc: '3 AoE ultimates — excellent for clumped engagements' }, { ico: '🟢', title: 'Push potential', desc: 'Lycan + Treant enables high tower pressure post-10 min' }, { ico: '🟡', title: 'Weak to splitpush', desc: "No hard answer to Phantom Lancer or Nature's Prophet" }] as s}
            <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
              <div class="text-xl shrink-0 mt-0.5">{s.ico}</div>
              <div>
                <div class="text-base font-bold mb-0.75">{s.title}</div>
                <div class="text-sm text-tx2 leading-relaxed">{s.desc}</div>
              </div>
            </div>
          {/each}
        </div>
      </div>
      <div class="card">
        <div class="card-hd"><span class="card-ttl">Dire Weaknesses</span></div>
        <div class="flex flex-col">
          {#each [{ ico: '🔴', title: 'No initiation', desc: 'Dire lacks a reliable engage — all fights start reactively' }, { ico: '🔴', title: 'Slow scaling', desc: '3 late-game carries with no mid-game win condition' }, { ico: '🟡', title: 'Vision gaps', desc: 'No support with reliable ward coverage; vulnerable to smoke ganks' }] as w}
            <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
              <div class="text-xl shrink-0 mt-0.5">{w.ico}</div>
              <div>
                <div class="text-base font-bold mb-0.75">{w.title}</div>
                <div class="text-sm text-tx2 leading-relaxed">{w.desc}</div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>
