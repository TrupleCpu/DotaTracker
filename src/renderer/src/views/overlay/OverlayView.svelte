<script lang="ts">
  import { onMount } from 'svelte'
  import { overlayStore } from '../../stores/overlayStore.svelte'
  import type { GSIUIState } from '../../types/gsi'

  type PlayGuideSlot = {
    slotIndex: number
    itemId: number
    targetMinute: number
    targetSecond?: number
    phase?: string
  }

  let lastLoadedHeroId: number | null = null
  let loadTimeout: ReturnType<typeof setTimeout> | null = null

  onMount(() => {
    window.api.onGsiStream((data: GSIUIState) => {
      overlayStore.updateFromGsi(data)
      const heroId = data.hero?.id ?? null
      if (heroId && heroId !== lastLoadedHeroId) {
        scheduleGuideLoad(heroId)
      }
    })

    window.api.onGuideUpdated((heroId: number) => {
      if (heroId === lastLoadedHeroId && heroId !== null) {
        scheduleGuideLoad(heroId)
      }
    })
  })

  function scheduleGuideLoad(heroId: number): void {
    if (loadTimeout) clearTimeout(loadTimeout)
    loadTimeout = setTimeout(async () => {
      lastLoadedHeroId = heroId
      try {
        const guide = await window.api.getPlayGuide(heroId)
        if (guide && (guide as { slots: unknown }).slots) {
          overlayStore.setGuideSlots((guide as { slots: PlayGuideSlot[] }).slots)
        } else {
          overlayStore.setGuideSlots([])
        }
      } catch {
        overlayStore.setGuideSlots([])
      }
    }, 500)
  }
</script>

<div
  class="tracking-container"
  role="complementary"
  aria-label="Real-time performance metrics overlay"
>
  {#if overlayStore.benchmarks && overlayStore.currentHeroId}
    <div class="stat {overlayStore.gpm_status}" role="group" aria-label="GPM metric">
      <span class="label">GPM</span>
      <span class="value font-mono font-tabular">{overlayStore.gpm}</span>
      <span class="diff"
        >{overlayStore.gpm_diff > 0 ? '+' : ''}{overlayStore.gpm_diff.toFixed(1)}%</span
      >
      <span class="badge icon"
        >{overlayStore.gpm_label === 'High'
          ? '▲'
          : overlayStore.gpm_label === 'Above'
            ? '▲'
            : overlayStore.gpm_label === 'Low'
              ? '▼'
              : '—'}</span
      >
    </div>

    <div class="stat {overlayStore.xpm_status}" role="group" aria-label="XPM metric">
      <span class="label">XPM</span>
      <span class="value font-mono font-tabular">{overlayStore.xpm}</span>
      <span class="diff"
        >{overlayStore.xpm_diff > 0 ? '+' : ''}{overlayStore.xpm_diff.toFixed(1)}%</span
      >
      <span class="badge icon"
        >{overlayStore.xpm_label === 'High'
          ? '▲'
          : overlayStore.xpm_label === 'Above'
            ? '▲'
            : overlayStore.xpm_label === 'Low'
              ? '▼'
              : '—'}</span
      >
    </div>

    <div class="divider" role="separator" aria-hidden="true"></div>

    <div class="stat {overlayStore.kpm_status}" role="group" aria-label="KPM metric">
      <span class="label">KPM</span>
      <span class="value font-mono font-tabular">{overlayStore.kpm_calc.toFixed(2)}</span>
      <span class="diff"
        >{overlayStore.kpm_diff > 0 ? '+' : ''}{overlayStore.kpm_diff.toFixed(1)}%</span
      >
      <span class="badge icon"
        >{overlayStore.kpm_label === 'High'
          ? '▲'
          : overlayStore.kpm_label === 'Above'
            ? '▲'
            : overlayStore.kpm_label === 'Low'
              ? '▼'
              : '—'}</span
      >
    </div>
  {:else}
    <div class="stat" role="group" aria-label="GPM metric">
      <span class="label">GPM</span>
      <span class="value font-mono font-tabular">{overlayStore.gpm}</span>
      <span class="diff">—</span>
      <span class="badge">—</span>
    </div>

    <div class="stat" role="group" aria-label="XPM metric">
      <span class="label">XPM</span>
      <span class="value font-mono font-tabular">{overlayStore.xpm}</span>
      <span class="diff">—</span>
      <span class="badge">—</span>
    </div>

    <div class="divider" role="separator" aria-hidden="true"></div>

    <div class="stat" role="group" aria-label="KPM metric">
      <span class="label">KPM</span>
      <span class="value font-mono font-tabular">{overlayStore.kpm_calc.toFixed(2)}</span>
      <span class="diff">—</span>
      <span class="badge">—</span>
    </div>
  {/if}
</div>

<style>
  :global(html),
  :global(body) {
    margin: 0 !important;
    padding: 0 !important;
    background: transparent !important;
    background-color: rgba(0, 0, 0, 0) !important;
    overflow: hidden !important;
  }

  .tracking-container {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 6px 20px;
    font-family: var(--font-sans);
    background: rgba(10, 10, 15, 0.88);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(124, 92, 191, 0.2);
    border-radius: 6px;
    user-select: none;
    width: 230px;
  }

  .stat {
    display: grid;
    grid-template-columns: 36px 48px 1fr auto;
    align-items: center;
    gap: 6px;
    font-size: var(--text-sm);
    font-weight: 600;
    letter-spacing: 0.04em;
    height: 20px;
  }

  .label {
    color: var(--color-tx2);
    text-align: left;
    white-space: nowrap;
  }

  .value {
    color: var(--color-tx);
    text-align: right;
    white-space: nowrap;
  }

  .stat.up {
    color: var(--color-gr);
  }

  .stat.down {
    color: var(--color-rd);
  }

  .diff {
    font-size: var(--text-xs);
    text-align: right;
    white-space: nowrap;
    font-weight: 500;
  }

  .badge {
    font-size: var(--text-xxs);
    padding: 1px 5px;
    border-radius: 3px;
    background: var(--color-s3);
    white-space: nowrap;
    font-weight: 700;
    letter-spacing: 0.3px;
  }

  .badge.icon {
    font-size: 11px;
    padding: 0 4px;
    background: transparent;
    line-height: 1;
  }

  .divider {
    height: 1px;
    background: var(--color-bd);
    margin: 2px 0;
  }

  .font-tabular {
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum';
  }
</style>
