<script lang="ts">
  import { CMP } from '../utils/mockData'
</script>

<div class="flex-1 overflow-y-auto p-4 select-none">
  <!-- HEADERS -->
  <div class="grid grid-cols-2 gap-4 mb-4">
    <div class="bg-s1 border border-bd rounded-lg p-4 text-center">
      <div
        class="w-12 h-12 rounded-full mx-auto mb-2.25 flex items-center justify-center text-[22px] bg-linear-to-br from-pu to-[#4f46e5]"
      >
        A
      </div>
      <div class="text-[14px] font-extrabold">Anthron Player</div>
      <div class="text-[11.5px] text-tx2 mt-0.75">MMR 2,450 · Archon III</div>
    </div>
    <div class="bg-s1 border border-bd rounded-lg p-4 text-center">
      <div
        class="w-12 h-12 rounded-full mx-auto mb-2.25 flex items-center justify-center text-[22px] bg-linear-to-br from-[#dc2626] to-[#4f46e5]"
      >
        R
      </div>
      <div class="text-[14px] font-extrabold">Rival_X9</div>
      <div class="text-[11.5px] text-tx2 mt-0.75">MMR 2,520 · Archon IV</div>
    </div>
  </div>

  <!-- COMPARISON LIST -->
  <div class="card">
    <div class="card-hd"><span class="card-ttl">Head to Head Stats</span></div>
    <div class="flex flex-col">
      {#each CMP as s}
        {@const total = s.lv + s.rv}
        {@const lp = Math.round((s.lv / total) * 100)}
        {@const rp = 100 - lp}
        <div class="flex items-center gap-2 py-2 border-b border-bd last:border-b-0">
          <div class="w-16 font-mono text-[13.5px] font-bold text-right text-bl">{s.left}</div>
          <div class="flex-1 flex gap-0.5 items-center h-1.5">
            <div class="h-full bg-bl rounded-l-xs ml-auto" style="width: {lp}%"></div>
            <div class="h-full bg-pu2 rounded-r-xs" style="width: {rp}%"></div>
          </div>
          <div class="flex-1 text-[12px] text-tx2 text-center font-semibold">{s.label}</div>
          <div class="w-16 font-mono text-[13.5px] font-bold text-left text-pu2">{s.right}</div>
        </div>
      {/each}
    </div>
  </div>
</div>
