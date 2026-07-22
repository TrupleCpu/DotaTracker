<script lang="ts">
  import AppLogo from '../assets/logo/AppLogo.png'

  let { onSaved }: { onSaved: () => void } = $props()
  let token = $state('')
  let errorMessage = $state('')
  let isSaving = $state(false)

  async function handleSave() {
    if (!token.trim()) {
      errorMessage = 'Token cannot be empty'
      return
    }

    try {
      isSaving = true
      errorMessage = ''
      await window.api.setStratzToken(token.trim())
      onSaved()
    } catch (err) {
      errorMessage = 'Failed to save token'
    } finally {
      isSaving = false
    }
  }
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-bg gap-5 select-none font-inter">
  <div class="relative">
    <div class="w-20 h-20 rounded-2xl bg-s1 border border-bd flex items-center justify-center shadow-md">
      <img src={AppLogo} alt="Ancient Eye Logo" class="w-14 h-14 object-contain" />
    </div>
  </div>

  <div class="text-center mb-2">
    <h1 class="text-xl font-extrabold tracking-[0.5px] text-tx uppercase leading-none">Stratz API Setup</h1>
    <p class="text-[10px] text-tx3 font-semibold uppercase tracking-[0.8px] mt-2">
      API Key required to fetch Dota 2 data
    </p>
  </div>

  <div class="flex flex-col gap-3 w-80">
    <input
      type="password"
      bind:value={token}
      placeholder="Paste your STRATZ API Token..."
      class="w-full px-4 py-2.5 rounded-lg bg-s1 border border-bd text-tx text-sm 
             focus:outline-none focus:border-pu focus:ring-1 focus:ring-pu transition-all
             placeholder:text-tx3"
      onkeydown={(e) => e.key === 'Enter' && handleSave()}
    />
    
    <button
      onclick={handleSave}
      disabled={isSaving}
      class="w-full flex items-center justify-center gap-3 px-6 py-2.5 rounded-lg
             bg-pub border border-pu/30
             text-tx text-sm font-semibold
             transition-all duration-150
             hover:border-pu hover:bg-pu/20
             disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {#if isSaving}
        <span>Saving...</span>
      {:else}
        <span>Save Token</span>
      {/if}
    </button>
  </div>

  {#if errorMessage}
    <div
      class="flex items-center gap-2 px-3 py-2 rounded-md text-xs
             bg-rdb border border-rd/20 text-rd font-semibold mt-2"
      role="alert"
    >
      <div class="w-1.5 h-1.5 rounded-full bg-rd shrink-0"></div>
      <span>{errorMessage}</span>
    </div>
  {/if}
</div>
