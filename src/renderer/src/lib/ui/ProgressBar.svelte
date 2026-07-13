<script lang="ts">
  let {
    value = 0,
    color = 'var(--color-pu)',
    bgClass = 'bg-s3',
    height = 'h-1.5',
    className = ''
  }: {
    value?: number
    color?: string
    bgClass?: string
    height?: string
    className?: string
  } = $props()
</script>

<div class="overflow-hidden rounded-sm {bgClass} {height} {className}">
  <div
    class="h-full rounded-sm transition-all"
    style="width: {Math.min(value, 100)}%; background: {color}"
  ></div>
</div>
