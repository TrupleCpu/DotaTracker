<script lang="ts">
  import { onMount } from 'svelte'

  // GSI State Metrics
  let gpm = $state<number>(0)
  let xpm = $state<number>(0)
  let kills = $state<number>(0)
  let clock = $state<number>(0)

  // Benchmarks Profiles
  let b_gpm = $state<number>(0)
  let b_xpm = $state<number>(0)
  let b_kpm = $state<number>(0)

  // Reactive Derivations
  let minutes = $derived(clock > 0 ? clock / 60 : 0)
  let kpm_calc = $derived(minutes > 0 ? kills / minutes : 0)

  let gpm_diff = $derived(b_gpm > 0 ? ((gpm - b_gpm) / b_gpm) * 100 : 0)
  let xpm_diff = $derived(b_xpm > 0 ? ((xpm - b_xpm) / b_xpm) * 100 : 0)
  let kpm_diff = $derived(b_kpm > 0 ? ((kpm_calc - b_kpm) / b_kpm) * 100 : 0)

  let gpm_status = $derived(gpm_diff >= 0 ? 'up' : 'down')
  let xpm_status = $derived(xpm_diff >= 0 ? 'up' : 'down')
  let kpm_status = $derived(kpm_diff >= 0 ? 'up' : 'down')

  function getLabel(diff: number): string {
    if (diff > 20) return 'High'
    if (diff > 0) return 'Above'
    if (diff > -20) return 'Avg'
    return 'Low'
  }

  let gpm_label = $derived(getLabel(gpm_diff))
  let xpm_label = $derived(getLabel(xpm_diff))
  let kpm_label = $derived(getLabel(kpm_diff))

  onMount(() => {
    // Connect to Main Process GSI Pipeline
    window.api.onGsiStream((data: any) => {
      if (data.player) {
        gpm = data.player.gpm ?? 0
        xpm = data.player.xpm ?? 0
        kills = data.player.kills ?? 0
      }

      if (data.hero) {
        b_gpm = data.hero.benchmark_gpm ?? 0
        b_xpm = data.hero.benchmark_xpm ?? 0
        b_kpm = data.hero.benchmark_kpm ?? 0
      }

      if (typeof data.clock === 'number') {
        clock = data.clock
      }
    })
  })
</script>

<div
  class="tracking-container"
  role="complementary"
  aria-label="Real-time performance metrics overlay"
>
  <div class="stat" role="group" aria-label="GPM metric">
    <span class="label">GPM</span>
    <span class="value font-mono font-tabular">{gpm}</span>
    <span class="diff font-mono font-tabular">({gpm_diff.toFixed(1)}%)</span>
    <span class="icon {gpm_status}" aria-hidden="true">
      {gpm_status === 'up' ? '▲' : '▼'}
    </span>
    <span class="badge">{gpm_label}</span>
  </div>

  <div class="stat" role="group" aria-label="XPM metric">
    <span class="label">XPM</span>
    <span class="value font-mono font-tabular">{xpm}</span>
    <span class="diff font-mono font-tabular">({xpm_diff.toFixed(1)}%)</span>
    <span class="icon {xpm_status}" aria-hidden="true">
      {xpm_status === 'up' ? '▲' : '▼'}
    </span>
    <span class="badge">{xpm_label}</span>
  </div>

  <div class="divider" role="separator" aria-hidden="true"></div>

  <div class="stat" role="group" aria-label="KPM metric">
    <span class="label">KPM</span>
    <span class="value font-mono font-tabular">{kpm_calc.toFixed(2)}</span>
    <span class="diff font-mono font-tabular">({kpm_diff.toFixed(1)}%)</span>
    <span class="icon {kpm_status}" aria-hidden="true">
      {kpm_status === 'up' ? '▲' : '▼'}
    </span>
    <span class="badge">{kpm_label}</span>
  </div>
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
    padding: 6px 10px;
    font-family: var(--font-sans);
    background: rgba(10, 10, 15, 0.88);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(124, 92, 191, 0.2);
    border-radius: 6px;
    user-select: none;
    width: 260px;
  }

  .stat {
    display: grid;
    grid-template-columns: 36px 48px 60px 18px 1fr;
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

  .diff {
    color: var(--color-tx3);
    font-size: var(--text-xs);
    text-align: right;
    white-space: nowrap;
  }

  .icon {
    font-size: 10px;
    width: 18px;
    text-align: center;
  }

  .up {
    color: var(--color-gr);
    text-shadow: 0 0 6px rgba(34, 197, 94, 0.4);
  }

  .down {
    color: var(--color-rd);
    text-shadow: 0 0 6px rgba(239, 68, 68, 0.4);
  }

  .badge {
    font-size: var(--text-xxs);
    padding: 1px 5px;
    border-radius: 3px;
    background: var(--color-s3);
    color: var(--color-tx2);
    justify-self: end;
    white-space: nowrap;
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
