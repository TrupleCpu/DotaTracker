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
    <span class="value font-tabular">{gpm}</span>
    <span class="diff font-tabular">({gpm_diff.toFixed(1)}%)</span>
    <span class="icon {gpm_status}" aria-hidden="true">
      {gpm_status === 'up' ? '▲' : '▼'}
    </span>
    <span class="badge">{gpm_label}</span>
  </div>

  <div class="stat" role="group" aria-label="XPM metric">
    <span class="label">XPM</span>
    <span class="value font-tabular">{xpm}</span>
    <span class="diff font-tabular">({xpm_diff.toFixed(1)}%)</span>
    <span class="icon {xpm_status}" aria-hidden="true">
      {xpm_status === 'up' ? '▲' : '▼'}
    </span>
    <span class="badge">{xpm_label}</span>
  </div>

  <div class="divider" role="separator" aria-hidden="true"></div>

  <div class="stat" role="group" aria-label="KPM metric">
    <span class="label">KPM</span>
    <span class="value font-tabular">{kpm_calc.toFixed(2)}</span>
    <span class="diff font-tabular">({kpm_diff.toFixed(1)}%)</span>
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
    align-items: stretch;
    gap: var(--space-1);
    padding: var(--space-2) var(--space-3);
    box-sizing: border-box;

    /* Semi-transparent slate-charcoal profile tint */
    background: rgba(15, 16, 21, 0.85) !important;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);

    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-md);

    user-select: none;
    width: 260px;
  }

  .stat {
    display: grid;
    grid-template-columns: 40px 50px 65px 18px 1fr;
    align-items: center;
    column-gap: var(--space-2);
    font-size: var(--text-sm);
    font-weight: var(--font-bold);
    letter-spacing: 0.06em;
    height: 22px;
  }

  .label {
    color: #9aa7b2;
    text-align: left;
    white-space: nowrap;
  }

  .value {
    color: #d7e0e7;
    text-align: right;
    white-space: nowrap;
  }

  .diff {
    color: #7f8c8d;
    font-size: 10px;
    text-align: right;
    white-space: nowrap;
  }

  .icon {
    font-size: 10px;
    font-weight: var(--font-bold);
    width: 18px;
    text-align: center;
  }

  .up {
    color: var(--accent-success);
    text-shadow: 0 0 6px var(--accent-success-glow);
  }

  .down {
    color: var(--accent-danger);
    text-shadow: 0 0 6px var(--accent-danger-glow);
  }

  .badge {
    font-size: 9px;
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-secondary);
    justify-self: end;
    white-space: nowrap;
    font-weight: var(--font-medium);
  }

  .divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.06);
    margin: var(--space-1) 0;
  }

  .font-tabular {
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum';
  }
</style>