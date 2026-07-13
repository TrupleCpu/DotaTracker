<script lang="ts">
  import { onMount } from 'svelte'
  import { overlayStore } from '../../stores/overlayStore.svelte'

  onMount(() => {
    window.api.onGsiStream((data: any) => {
      overlayStore.updateFromGsi(data)
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
    <span class="value font-mono font-tabular">{overlayStore.gpm}</span>
    <span class="diff font-mono font-tabular">({overlayStore.gpm_diff.toFixed(1)}%)</span>
    <span class="icon {overlayStore.gpm_status}" aria-hidden="true">
      {overlayStore.gpm_status === 'up' ? '▲' : '▼'}
    </span>
    <span class="badge">{overlayStore.gpm_label}</span>
  </div>

  <div class="stat" role="group" aria-label="XPM metric">
    <span class="label">XPM</span>
    <span class="value font-mono font-tabular">{overlayStore.xpm}</span>
    <span class="diff font-mono font-tabular">({overlayStore.xpm_diff.toFixed(1)}%)</span>
    <span class="icon {overlayStore.xpm_status}" aria-hidden="true">
      {overlayStore.xpm_status === 'up' ? '▲' : '▼'}
    </span>
    <span class="badge">{overlayStore.xpm_label}</span>
  </div>

  <div class="divider" role="separator" aria-hidden="true"></div>

  <div class="stat" role="group" aria-label="KPM metric">
    <span class="label">KPM</span>
    <span class="value font-mono font-tabular">{overlayStore.kpm_calc.toFixed(2)}</span>
    <span class="diff font-mono font-tabular">({overlayStore.kpm_diff.toFixed(1)}%)</span>
    <span class="icon {overlayStore.kpm_status}" aria-hidden="true">
      {overlayStore.kpm_status === 'up' ? '▲' : '▼'}
    </span>
    <span class="badge">{overlayStore.kpm_label}</span>
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
