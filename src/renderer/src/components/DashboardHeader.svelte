<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let steamId: string
  export let isOverlayEnabled: boolean
  export let toggleOverlay: () => Promise<void>

  const dispatch = createEventDispatcher<{ disconnect: null }>()
</script>

<header class="navbar">
  <div class="profile-meta">
    <div class="status-indicator"></div>
    <span>Syncing Account: <code class="uid">{steamId}</code></span>
  </div>
  <div class="nav-actions">
    <button on:click={toggleOverlay} class="toggle-btn {isOverlayEnabled ? 'active' : 'inactive'}">
      {isOverlayEnabled ? 'Overlay ON' : 'Overlay OFF'}
    </button>
    <button on:click={() => dispatch('disconnect')} class="nav-disconnect-btn">
      Disconnect Account
    </button>
  </div>
</header>

<style>
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #1c1e2d;
    padding: 12px 20px;
    border-bottom: 1px solid #2a2d42;
  }
  .profile-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: #94a3b8;
  }
  .status-indicator {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    box-shadow: 0 0 8px #10b981;
  }
  .uid {
    background: #0f1015;
    padding: 3px 6px;
    border-radius: 4px;
    color: #a7f3d0;
    font-family: monospace;
  }
  .nav-actions {
    display: flex;
    gap: 10px;
  }
  .toggle-btn {
    border: none;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .toggle-btn.active {
    background: #10b981;
    color: #0f1015;
  }
  .toggle-btn.inactive {
    background: #475569;
    color: #e2e8f0;
  }
  .nav-disconnect-btn {
    background: #2d3149;
    color: #94a3b8;
    border: none;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 4px;
    cursor: pointer;
    transition:
      background 0.2s,
      color 0.2s;
  }
  .nav-disconnect-btn:hover {
    background: #ef4444;
    color: #ffffff;
  }
</style>
