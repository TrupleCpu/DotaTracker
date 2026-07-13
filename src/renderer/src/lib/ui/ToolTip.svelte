<script lang="ts">
  import type { Snippet } from 'svelte'

  let { text, children }: { text: string; children: Snippet } = $props()
</script>

<div class="relative group shrink-0 flex items-center justify-center">
  {@render children()}

  <div
    class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-s4 border border-bd2 px-2 py-1 text-xs font-semibold text-tx opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-100 ease-out z-50 shadow-lg"
  >
    {text}
  </div>
</div>
