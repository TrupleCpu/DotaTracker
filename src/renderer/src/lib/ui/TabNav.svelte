<script lang="ts">
  interface Tab {
    id: string
    label: string
  }

  let {
    tabs,
    active,
    onTabChange,
    variant = 'default'
  }: {
    tabs: Tab[]
    active: string
    onTabChange: (id: string) => void
    variant?: 'default' | 'pill' | 'underline'
  } = $props()
</script>

{#if variant === 'pill'}
  <div class="flex gap-0.5 bg-s2 rounded-lg p-0.75 w-fit">
    {#each tabs as tab (tab.id)}
      <button
        class="px-3.25 py-1.25 rounded-md border-none bg-transparent text-tx2 text-sm font-medium cursor-pointer transition-all
          {active === tab.id ? 'bg-s4 text-tx' : 'hover:text-tx'}"
        onclick={() => onTabChange(tab.id)}
      >
        {tab.label}
      </button>
    {/each}
  </div>
{:else if variant === 'underline'}
  <div class="flex border-b border-bd">
    {#each tabs as tab (tab.id)}
      <button
        class="px-4.25 py-2.25 text-base font-semibold transition-all border-b-2 bg-transparent cursor-pointer
          {active === tab.id ? 'text-tx border-pu' : 'text-tx2 border-transparent hover:text-tx'}"
        onclick={() => onTabChange(tab.id)}
      >
        {tab.label}
      </button>
    {/each}
  </div>
{:else}
  <div class="flex gap-0.5">
    {#each tabs as tab (tab.id)}
      <button
        class="p-[6px_12px] text-sm font-bold rounded-md transition-all cursor-pointer border
          {active === tab.id
          ? 'bg-pub border-pu text-tx'
          : 'bg-transparent border-transparent text-tx2 hover:text-tx hover:bg-s2'}"
        onclick={() => onTabChange(tab.id)}
      >
        {tab.label}
      </button>
    {/each}
  </div>
{/if}
