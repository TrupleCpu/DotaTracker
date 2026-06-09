<script lang="ts">
  export let handleSteamLogin: () => Promise<void>
  export let isLoading: boolean
  export let errorMessage: string
</script>

<div class="login-screen">
  <div class="login-card">
    <div class="logo-area"><span class="logo-accent">DOTA 2</span> TRACKER</div>
    <p class="subtitle">Sync your local client instance to audit real-time statistics.</p>

    <button on:click={handleSteamLogin} disabled={isLoading} class="steam-sync-btn">
      {#if isLoading}
        <div class="spinner"></div>
        <span>READING LOCAL CONFIGS...</span>
      {:else}
        <img
          src="https://community.akamai.steamstatic.com/public/images/signinthroughsteam/sits_01.png"
          alt="Sign In"
        />
      {/if}
    </button>

    {#if errorMessage}
      <div class="error-banner" style="margin-top: 15px;">{errorMessage}</div>
    {/if}
  </div>
</div>

<style>
  .login-screen {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: radial-gradient(circle at center, #1b1c24 0%, #0f1015 100%);
    padding: 20px;
    box-sizing: border-box;
  }
  .login-card {
    text-align: center;
    background: #15161e;
    padding: 40px 30px;
    border-radius: 12px;
    border: 1px solid #262837;
    max-width: 360px;
    width: 100%;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }
  .logo-area {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: 2px;
    color: #ffffff;
    margin-bottom: 10px;
  }
  .logo-accent {
    color: #10b981;
  }
  .subtitle {
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.5;
    margin-bottom: 30px;
  }
  .steam-sync-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition:
      transform 0.2s,
      opacity 0.2s;
  }
  .steam-sync-btn:hover {
    transform: scale(1.02);
  }
  .steam-sync-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .error-banner {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid #ef4444;
    color: #fca5a5;
    padding: 10px;
    border-radius: 6px;
    font-size: 12px;
    text-align: center;
  }
  .spinner {
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border-top-color: #ffffff;
    animation: spin 0.8s linear infinite;
    width: 16px;
    height: 16px;
    display: inline-block;
    margin-right: 8px;
    vertical-align: middle;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
