<script lang="ts">
  import itemsData from '../../../../main/data/items.json'

  let {
    slotIndex,
    itemId = $bindable(0),
    targetMinute = $bindable(0),
    targetSecond = $bindable(0)
  }: {
    slotIndex: number
    itemId?: number
    targetMinute?: number
    targetSecond?: number
  } = $props()

  let isOver = $state(false)

  const itemInfo = $derived.by(() => {
    if (!itemId || itemId === 0) return null
    for (const val of Object.values(itemsData)) {
      const v = val as Record<string, unknown>
      if (v?.id === itemId) {
        return {
          dname: v.dname as string,
          img: ((v.img as string) ?? '').replace('item-assets/', '')
        }
      }
    }
    return null
  })

  function handleDragOver(e: DragEvent): void {
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
    isOver = true
  }

  function handleDragLeave(): void {
    isOver = false
  }

  function handleDrop(e: DragEvent): void {
    e.preventDefault()
    isOver = false
    const data = e.dataTransfer?.getData('text/plain')
    if (data) {
      const parsed = Number(data)
      if (!isNaN(parsed) && parsed > 0) {
        itemId = parsed
      }
    }
  }

  function handleRemove(): void {
    itemId = 0
  }
</script>

<div
  class="slot"
  class:drag-over={isOver}
  class:filled={itemId !== 0}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  role="button"
  tabindex="0"
>
  <div class="slot-header">
    <span class="slot-label">Slot {slotIndex + 1}</span>
    {#if itemId !== 0}
      <button
        class="remove-btn"
        onclick={handleRemove}
        aria-label="Remove item"
      >×</button>
    {/if}
  </div>

  <div class="slot-body">
    {#if itemId !== 0 && itemInfo}
      <div class="item-display">
        <div class="w-14 h-14 rounded overflow-hidden bg-s1 shrink-0">
          <img
            src="item-asset://{itemInfo.img}"
            alt={itemInfo.dname}
            class="w-full h-full object-cover"
          />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-sm text-tx font-semibold truncate">{itemInfo.dname}</div>
        </div>
      </div>
    {:else}
      <div class="empty-placeholder">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-tx3/40">
          <path d="M12 5v14M5 12h14" stroke-linecap="round" />
        </svg>
        <span>Drop item here</span>
      </div>
    {/if}
  </div>

  <div class="slot-footer">
    <span class="time-label">Target:</span>
    <div class="time-input-group">
      <input
        type="number"
        min="0"
        max="120"
        bind:value={targetMinute}
        class="time-input"
        disabled={itemId === 0}
      />
      <span class="time-sep">:</span>
      <input
        type="number"
        min="0"
        max="59"
        bind:value={targetSecond}
        class="time-input sec"
        disabled={itemId === 0}
      />
    </div>
  </div>
</div>

<style>
  .slot {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    border-radius: 12px;
    background: var(--color-s1);
    border: 1px solid var(--color-bd);
    transition: all 0.15s;
    min-height: 170px;
  }
  .slot.filled {
    background: var(--color-s2);
    border-color: var(--color-pu2);
  }
  .slot.drag-over {
    border-color: var(--color-pu);
    background: var(--color-pub);
  }
  .slot-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .slot-label {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-tx2);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .remove-btn {
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    border: none;
    background: var(--color-rdb);
    color: var(--color-rd);
    font-size: 13px;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    transition: background 0.1s;
  }
  .remove-btn:hover {
    background: var(--color-rd);
    color: white;
  }
  .slot-body {
    flex: 1;
    display: flex;
    align-items: center;
  }
  .item-display {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }
  .empty-placeholder {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: var(--color-tx3);
    font-size: var(--text-xs);
    opacity: 0.5;
  }
  .slot-footer {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .time-label {
    font-size: var(--text-xs);
    color: var(--color-tx3);
    font-weight: 500;
  }
  .time-input-group {
    display: flex;
    align-items: center;
    gap: 1px;
  }
  .time-input {
    width: 40px;
    padding: 3px 4px;
    border-radius: 4px;
    border: 1px solid var(--color-bd);
    background: var(--color-s1);
    color: var(--color-tx);
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    text-align: center;
    outline: none;
    -moz-appearance: textfield;
  }
  .time-input::-webkit-outer-spin-button,
  .time-input::-webkit-inner-spin-button {
    display: none;
  }
  .time-input:focus {
    border-color: var(--color-pu);
  }
  .time-input:disabled {
    opacity: 0.3;
  }
  .time-input.sec {
    width: 36px;
  }
  .time-sep {
    font-size: var(--text-xs);
    color: var(--color-tx3);
    font-family: var(--font-mono);
  }
</style>
