<script lang="ts">
  export let handleSteamLogin: () => Promise<void>
  export let isLoading: boolean
  export let errorMessage: string
</script>

<div
  class="login-screen"
  role="main"
  aria-label="Login to Dota Coach Tracker"
>
  <div class="login-card">
    <div class="login-header">
      <div class="brand-logo">
        <span class="brand-highlight">DOTA 2</span> COACH
      </div>
      <p class="brand-subtitle">
        Sync your local client instance to audit real-time statistics.
      </p>
    </div>

    <button
      onclick={handleSteamLogin}
      disabled={isLoading}
      class="steam-login-button"
      aria-label={isLoading ? 'Syncing with Steam...' : 'Sign in with Steam'}
    >
      {#if isLoading}
        <div
          class="spinner"
          role="status"
          aria-label="Loading"
        >
          <span class="sr-only">Syncing with Steam...</span>
        </div>
        <span class="button-text">READING LOCAL CONFIGS...</span>
      {:else}
        <img
          src="https://community.akamai.steamstatic.com/public/images/signinthroughsteam/sits_01.png"
          alt="Sign in with Steam"
          class="steam-button-image"
        />
      {/if}
    </button>

    {#if errorMessage}
      <div
        class="error-message"
        role="alert"
        aria-live="assertive"
      >
        <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        {errorMessage}
      </div>
    {/if}
  </div>
</div>

<style>
  .login-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: var(--space-6);
    background: radial-gradient(circle at center, #1b1c24 0%, #0f1015 100%);
  }

  .login-card {
    width: 100%;
    max-width: 380px;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    padding: var(--space-10);
    text-align: center;
    box-shadow: var(--shadow-lg);
  }

  .login-header {
    margin-bottom: var(--space-7);
  }

  .brand-logo {
    font-size: var(--text-2xl);
    font-weight: var(--font-extrabold);
    letter-spacing: 0.1em;
    color: var(--text-primary);
    margin-bottom: var(--space-4);
    text-transform: uppercase;
  }

  .brand-highlight {
    color: var(--accent-success);
  }

  .brand-subtitle {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
  }

  .steam-login-button {
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: transform var(--transition-fast);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
  }

  .steam-login-button:not(:disabled):hover {
    transform: scale(1.02);
  }

  .steam-login-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .steam-button-image {
    max-width: 100%;
    height: auto;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-top-color: var(--text-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .button-text {
    font-size: var(--text-sm);
    color: var(--text-primary);
    font-weight: var(--font-semibold);
    letter-spacing: 0.05em;
  }

  .error-message {
    margin-top: var(--space-4);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-3);
    background: var(--accent-danger-bg);
    border: 1px solid var(--accent-danger);
    border-radius: var(--radius-md);
  }

  .error-icon {
    width: 16px;
    height: 16px;
    color: var(--accent-danger);
    flex-shrink: 0;
  }

  .error-message {
    font-size: var(--text-xs);
    color: #fca5a5;
    text-align: center;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>