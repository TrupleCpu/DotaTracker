<script lang="ts">
  let {
    class: className = '',
    width = '100%',
    height = '20px',
    rounded = 'md'
  }: {
    class?: string
    width?: string
    height?: string
    rounded?: string
  } = $props()
</script>

<div
  class="animate-pulse bg-s4/60 rounded-{rounded} {className}"
  style="width: {width}; height: {height}"
></div>
