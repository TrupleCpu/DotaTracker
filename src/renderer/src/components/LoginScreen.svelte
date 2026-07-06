<script lang="ts">
  import AppLogo from '../assets/logo/AppLogo.png'

  export let handleSteamLogin: () => Promise<void>
  export let errorMessage: string
  export let isLoading: boolean = false // ✅ add this
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-bg gap-5 select-none">
  <div class="relative">
    <div class="w-20 h-20 rounded-2xl bg-s1 border border-bd flex items-center justify-center shadow-md">
      <img src={AppLogo} alt="Ancient Eye Logo" class="w-14 h-14 object-contain" />
    </div>
  </div>

  <div class="text-center">
    <h1 class="text-xl font-extrabold tracking-[0.5px] text-tx uppercase leading-none">Ancient Eye</h1>
    <p class="text-[10px] text-tx3 font-semibold uppercase tracking-[0.8px] mt-2">
      Analyze &middot; Improve &middot; Win
    </p>
  </div>

  <button
    on:click={handleSteamLogin}
    disabled={isLoading}
    class="flex items-center gap-3 px-6 py-3 rounded-lg
           bg-transparent border border-bd
           text-tx2 text-sm font-semibold
           transition-all duration-150
           hover:border-pu hover:text-tx hover:bg-pub
           disabled:opacity-40 disabled:cursor-not-allowed
           group"
    aria-label="Sign in through Steam"
  >
    {#if isLoading}
      <svg
        class="animate-spin text-pu2"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="2"
          stroke-dasharray="31.4"
          stroke-dashoffset="10"
        />
      </svg>
      <span>Syncing Steam profile…</span>
    {:else}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="text-tx3 group-hover:text-pu2 transition-colors"
      >
        <path
          d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312L10 15.657A3.001 3.001 0 0 1 12 10a3 3 0 0 1 2.99 2.804l3.522-1.457C17.864 7.182 15.19 2 12 2z"
          fill="currentColor"
        />
        <path
          d="M2 12c0 5.523 4.477 10 10 10a9.958 9.958 0 0 0 3.868-.775l-4.13-1.709A3.001 3.001 0 0 1 9 16.829v-.002l-3.196-1.322A9.978 9.978 0 0 1 2 12z"
          fill="currentColor"
          opacity="0.7"
        />
        <circle cx="17" cy="9" r="3.5" fill="currentColor" />
      </svg>
      <span>Sign in with Steam</span>
    {/if}
  </button>

  {#if errorMessage}
    <div
      class="flex items-center gap-2 px-3 py-2 rounded-md text-xs
             bg-rdb border border-rd/20 text-rd font-semibold"
      role="alert"
    >
      <div class="w-1.5 h-1.5 rounded-full bg-rd shrink-0"></div>
      <span>{errorMessage}</span>
    </div>
  {/if}

  <p class="text-[10px] text-tx3 tracking-wide opacity-40">
    Not associated with Valve Corp.
  </p>
</div>

<style>
  @keyframes slideDown {
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
