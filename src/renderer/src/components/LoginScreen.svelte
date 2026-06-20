<script lang="ts">
  import AppLogo from '../assets/logo/AppLogo.png'
  export let handleSteamLogin: () => Promise<void>
  export let errorMessage: string
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-[var(--color-bg)] gap-4">
  <img src={AppLogo} alt="Ancient Eye Logo" class="w-24 h-24 object-contain" />

  <h1 class="text-2xl font-bold tracking-widest text-[var(--color-tx)] uppercase">Ancient Eye</h1>

  <p
    class="text-[11px] text-[var(--color-tx2)] text-center leading-relaxed max-w-[220px] tracking-wide"
  >
    Sync your Steam client to load real-time statistics and coaching data.
  </p>

  <button
    on:click={handleSteamLogin}
    class="mt-2 flex items-center gap-3 px-6 py-3 rounded-lg
           bg-transparent border border-white/10
           text-white/50 text-sm font-semibold tracking-wide
           transition-all duration-200
           hover:border-white/20 hover:text-white/80
           group"
    aria-label="Sign in through Steam"
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="opacity-60 group-hover:opacity-90 transition-opacity"
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
      <circle cx="17" cy="9" r="2" fill="transparent" />
    </svg>
    <span>Sign in through Steam</span>
  </button>

  <p class="text-[10px] text-[var(--color-tx2)] opacity-30 tracking-wide">
    Not associated with Valve Corp.
  </p>

  {#if errorMessage}
    <div
      class="flex items-center gap-2 px-3 py-2.5 rounded-md text-[11.5px]
             bg-[var(--color-rdb)] border border-red-500/15 text-[var(--color-rd)]
             animate-[slideDown_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]"
      role="alert"
    >
      <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-rd)] shrink-0"></span>
      <span>{errorMessage}</span>
    </div>
  {/if}
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
