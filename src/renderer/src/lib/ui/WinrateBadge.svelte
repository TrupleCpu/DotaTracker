<script lang="ts">
  let { value = 0, className = '' }: { value?: number; className?: string } = $props()

  let colorClass = $derived(
    value >= 60 ? 'bg-grb text-gr' : value >= 50 ? 'bg-gdb text-gd' : 'bg-rdb text-rd'
  )
</script>

<span
  class="text-xs font-bold px-2 py-0.5 rounded-full tracking-wide shrink-0 {colorClass} {className}"
>
  {value}%
</span>
