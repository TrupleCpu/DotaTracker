<script lang="ts">
  let { text = 'Loading…', className = '' }: { text?: string; className?: string } = $props()
</script>

<div class="flex items-center justify-center py-10 {className}">
  <span class="text-sm text-tx3 animate-pulse">{text}</span>
</div>
