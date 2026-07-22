<script lang="ts">
  import { onMount } from 'svelte'

  let itemName = $state('')
  let itemImg = $state<string | null>(null)
  let targetMinute = $state(0)
  let acquiredAtClock = $state(0)
  let diffSeconds = $state(0)

  function formatClock(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  function formatDiff(diff: number): string {
    const abs = Math.abs(diff)
    const m = Math.floor(abs / 60)
    const s = abs % 60
    const sign = diff <= 0 ? 'faster' : 'slower'
    return `${m}m ${s}s ${sign}`
  }

  onMount(() => {
    window.api.onGuideNotification((data) => {
      itemName = data.itemName
      itemImg = data.itemImg
      targetMinute = data.targetMinute
      acquiredAtClock = data.acquiredAtClock
      diffSeconds = data.diffSeconds
    })
  })
</script>

{#if itemName}
  <div class="notification" class:late={diffSeconds > 0} class:early={diffSeconds <= 0}>
    <div class="notif-body">
      {#if itemImg}
        <img src="item-asset://{itemImg}" alt={itemName} class="item-icon" />
      {:else}
        <div class="item-icon-placeholder">?</div>
      {/if}
      <div class="notif-text">
        <div class="notif-title">{itemName}</div>
        <div class="notif-time">
          @ {formatClock(acquiredAtClock)}
          <span class="notif-diff">{formatDiff(diffSeconds)}</span>
        </div>
        <div class="notif-target">Target: {targetMinute}:00</div>
      </div>
    </div>
  </div>
{/if}

<style>
  :global(html),
  :global(body) {
    margin: 0 !important;
    padding: 0 !important;
    background: transparent !important;
    overflow: hidden !important;
  }

  .notification {
    padding: 12px 14px;
    font-family: var(--font-sans);
    background: rgba(10, 10, 15, 0.92);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 8px;
    user-select: none;
    animation: fadeIn 0.2s ease-out;
  }
  .notification.early {
    border: 1px solid rgba(34, 197, 94, 0.5);
  }
  .notification.late {
    border: 1px solid rgba(239, 68, 68, 0.5);
  }

  .notif-body {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .item-icon {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 4px;
    flex-shrink: 0;
  }
  .item-icon-placeholder {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    background: var(--color-s3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: var(--color-tx3);
    flex-shrink: 0;
  }

  .notif-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .notif-title {
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--color-tx);
  }
  .notif-time {
    font-size: var(--text-xs);
    color: var(--color-tx2);
  }
  .notif-diff {
    font-weight: 600;
  }
  .notif-target {
    font-size: var(--text-xxs);
    color: var(--color-tx3);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
