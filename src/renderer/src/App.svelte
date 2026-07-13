<script lang="ts">
  import Overlay from './Overlay.svelte'
  import ControlPanel from './ControlPanel.svelte'

  const urlParams = new URLSearchParams(window.location.search)
  const view = urlParams.get('view')
</script>

{#if view === 'control'}
  <ControlPanel />
{:else}
  <Overlay />
{/if}
