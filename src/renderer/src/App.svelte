<script lang="ts">
  import Overlay from './Overlay.svelte'
  import ControlPanel from './ControlPanel.svelte'
  import GuideNotificationView from './views/overlay/GuideNotificationView.svelte'

  const urlParams = new URLSearchParams(window.location.search)
  const view = urlParams.get('view')
</script>

{#if view === 'control'}
  <ControlPanel />
{:else if view === 'guide-notification'}
  <GuideNotificationView />
{:else}
  <Overlay />
{/if}
