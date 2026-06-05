<script lang="ts">
  import { onMount } from 'svelte'

  // GSI State Metrics
  let gpm: number = 0
  let xpm: number = 0
  let kills: number = 0
  let clock: number = 0

  // Benchmarks Profiles
  let b_gpm: number = 0
  let b_xpm: number = 0
  let b_kpm: number = 0

  // Reactive Derivations
  $: minutes = clock > 0 ? clock / 60 : 0
  $: kpm_calc = minutes > 0 ? kills / minutes : 0

  $: gpm_diff = b_gpm > 0 ? ((gpm - b_gpm) / b_gpm) * 100 : 0
  $: xpm_diff = b_xpm > 0 ? ((xpm - b_xpm) / b_xpm) * 100 : 0
  $: kpm_diff = b_kpm > 0 ? ((kpm_calc - b_kpm) / b_kpm) * 100 : 0

  $: gpm_status = gpm_diff >= 0 ? 'up' : 'down'
  $: xpm_status = xpm_diff >= 0 ? 'up' : 'down'
  $: kpm_status = kpm_diff >= 0 ? 'up' : 'down'

  function getLabel(diff: number): string {
    if (diff > 20) return 'High'
    if (diff > 0) return 'Above'
    if (diff > -20) return 'Avg'
    return 'Low'
  }

  $: gpm_label = getLabel(gpm_diff)
  $: xpm_label = getLabel(xpm_diff)
  $: kpm_label = getLabel(kpm_diff)

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

<div class="tracking-container">
  <div class="stat">
    <span class="label">GPM</span>
    <span class="value">{gpm}</span>
    <span class="diff">({gpm_diff.toFixed(1)}%)</span>
    <span class="icon {gpm_status}">
      {gpm_status === 'up' ? '▲' : '▼'}
    </span>
    <span class="badge">{gpm_label}</span>
  </div>


  <div class="stat">
    <span class="label">XPM</span>
    <span class="value">{xpm}</span>
    <span class="diff">({xpm_diff.toFixed(1)}%)</span>
    <span class="icon {xpm_status}">
      {xpm_status === 'up' ? '▲' : '▼'}
    </span>
    <span class="badge">{xpm_label}</span>
  </div>

  <div class="divider"></div>

  <div class="stat">
    <span class="label">KPM</span>
    <span class="value">{kpm_calc.toFixed(2)}</span>
    <span class="diff">({kpm_diff.toFixed(1)}%)</span>
    <span class="icon {kpm_status}">
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
    gap: 5px;
    padding: 6px 10px;
    box-sizing: border-box;

    background: rgba(15, 16, 21, 0.75) !important;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    border: 1px solid rgba(255, 255, 255, 0.05);

    user-select: none;
    width: 240px;
  }

  .stat {
    display: grid;
    grid-template-columns: 30px 45px 60px 15px 1fr;
    align-items: center;
    column-gap: 6px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    height: 20px;
  }

  
  .label {
    color: #9aa7b2;
    text-align: left;
    white-space: nowrap;
  }

  .value {
    color: #d7e0e7;
    text-align: right;
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum';
    white-space: nowrap;
  }

  .diff {
    color: #7f8c8d;
    font-size: 11px;
    text-align: right;
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum';
    white-space: nowrap;
  }

  .icon {
    font-size: 11px;
    font-weight: 900;
    width: 15px;
    text-align: center;
  }

  .up {
    color: #10b981; /* Unified Emerald green accent */
    text-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
  }

  .down {
    color: #ef4444;
    text-shadow: 0 0 6px rgba(239, 68, 68, 0.4);
  }

  .badge {
    font-size: 10px;
    padding: 1px 5px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.06);
    color: #cfd8dc;
    justify-self: end;
    white-space: nowrap;
  }
</style>
