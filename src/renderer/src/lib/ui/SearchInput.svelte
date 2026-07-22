<script lang="ts">
  let {
    value = $bindable(''),
    placeholder = 'Search…',
    className = ''
  }: { value?: string; placeholder?: string; className?: string } = $props()
</script>

<div class="relative max-w-xs flex-1 {className}">
  <input
    type="text"
    bind:value
    {placeholder}
    class="w-full bg-s2 border border-bd rounded-[5px] text-tx2 p-[5px_10px_5px_26px] text-xs font-semibold outline-hidden focus:border-pu transition-colors placeholder:text-tx3"
  />
  <svg
    class="absolute left-2 top-1/2 -translate-y-1/2"
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="var(--color-tx3)"
  >
    <path
      d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"
    />
  </svg>
</div>
