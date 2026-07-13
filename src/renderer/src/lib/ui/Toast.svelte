<script lang="ts">
  import { uiStore } from '../../stores/uiStore.svelte'
</script>

{#if uiStore.toast.show}
  <div
    class="fixed bottom-5 right-5 bg-s4 border border-bd rounded-lg px-4 py-2.5 text-sm font-semibold text-tx z-[9999] transition-all duration-200 pointer-events-none min-w-[140px] shadow-md
      {uiStore.toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      {uiStore.toast.type === 'ok'
      ? 'border-gr text-gr'
      : uiStore.toast.type === 'err'
        ? 'border-rd text-rd'
        : ''}"
  >
    {uiStore.toast.msg}
  </div>
{/if}
