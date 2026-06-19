<script lang="ts">
  import { RADIANT, DIRE } from '../utils/mockData'
</script>

<div class="flex-1 overflow-y-auto p-4 select-none">
  <!-- DRAFT GRID -->
  <div class="grid grid-cols-2 gap-4 mb-4">
    <div class="bg-s1 border border-bd rounded-lg p-[14px]">
      <div class="text-[13px] font-extrabold mb-[11px] flex items-center gap-1.75 text-gr">
        ⬛ Radiant
      </div>
      <div class="flex flex-col gap-1.5">
        {#each RADIANT as h}
          <div
            class="flex items-center gap-2.5 p-2 bg-s2 rounded-md border border-bd hover:border-bd2 transition-colors"
          >
            <div
              class="w-[34px] h-[34px] rounded-sm bg-s3 flex items-center justify-center text-[17px] shrink-0"
            >
              {h.icon}
            </div>
            <div>
              <div class="font-bold text-[12.5px]">{h.name}</div>
              <div class="text-[10px] text-tx2 mt-0.5">{h.role}</div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="bg-s1 border border-bd rounded-lg p-[14px]">
      <div class="text-[13px] font-extrabold mb-[11px] flex items-center gap-1.75 text-rd">
        ⬛ Dire
      </div>
      <div class="flex flex-col gap-1.5">
        {#each DIRE as h}
          {#if h}
            <div
              class="flex items-center gap-2.5 p-2 bg-s2 rounded-md border border-bd hover:border-bd2 transition-colors"
            >
              <div
                class="w-[34px] h-[34px] rounded-sm bg-s3 flex items-center justify-center text-[17px] shrink-0"
              >
                {h.icon}
              </div>
              <div>
                <div class="font-bold text-[12.5px]">{h.name}</div>
                <div class="text-[10px] text-tx2 mt-0.5">{h.role}</div>
              </div>
            </div>
          {:else}
            <div
              class="flex items-center justify-center border border-dashed border-bd rounded-md p-3 text-tx3 text-[11px] cursor-pointer hover:border-pu hover:text-pu2 transition-colors h-[52px]"
            >
              + Pick hero
            </div>
          {/if}
        {/each}
      </div>
    </div>
  </div>

  <!-- ADVANTAGE BAR -->
  <div class="bg-s1 border border-bd rounded-lg p-[14px_16px] mb-4">
    <div class="text-[12px] font-bold text-tx2 mb-1">Draft Advantage Analysis</div>
    <div class="h-2.25 bg-s2 rounded-sm overflow-hidden relative my-2">
      <div class="absolute left-0 top-0 h-full bg-gr rounded-l-sm" style="width: 58%"></div>
      <div class="absolute right-0 top-0 h-full bg-rd rounded-r-sm" style="width: 42%"></div>
      <div class="absolute left-1/2 top-0 h-full w-0.5 bg-bg -translate-x-1/2"></div>
    </div>
    <div class="flex justify-between text-[11px] font-bold">
      <span class="text-gr">Radiant 58%</span>
      <span class="text-tx2">Win Probability</span>
      <span class="text-rd">42% Dire</span>
    </div>
  </div>

  <!-- CRITIQUE DETAILS -->
  <div class="grid grid-cols-2 gap-4">
    <div class="card">
      <div class="card-hd"><span class="card-ttl">Radiant Strengths</span></div>
      <div class="flex flex-col">
        <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
          <div class="text-[17px] shrink-0 mt-0.5">🟢</div>
          <div>
            <div class="text-[12.5px] font-bold mb-0.75">Strong teamfight</div>
            <div class="text-[11.5px] text-tx2 line-height-[1.6]">
              3 AoE ultimates — excellent for clumped engagements
            </div>
          </div>
        </div>
        <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
          <div class="text-[17px] shrink-0 mt-0.5">🟢</div>
          <div>
            <div class="text-[12.5px] font-bold mb-0.75">Push potential</div>
            <div class="text-[11.5px] text-tx2 line-height-[1.6]">
              Lycan + Treant enables high tower pressure post-10 min
            </div>
          </div>
        </div>
        <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
          <div class="text-[17px] shrink-0 mt-0.5">🟡</div>
          <div>
            <div class="text-[12.5px] font-bold mb-0.75">Weak to splitpush</div>
            <div class="text-[11.5px] text-tx2 line-height-[1.6]">
              No hard answer to Phantom Lancer or Nature's Prophet
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-hd"><span class="card-ttl">Dire Weaknesses</span></div>
      <div class="flex flex-col">
        <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
          <div class="text-[17px] shrink-0 mt-0.5">🔴</div>
          <div>
            <div class="text-[12.5px] font-bold mb-0.75">No initiation</div>
            <div class="text-[11.5px] text-tx2 line-height-[1.6]">
              Dire lacks a reliable engage — all fights start reactively
            </div>
          </div>
        </div>
        <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
          <div class="text-[17px] shrink-0 mt-0.5">🔴</div>
          <div>
            <div class="text-[12.5px] font-bold mb-0.75">Slow scaling</div>
            <div class="text-[11.5px] text-tx2 line-height-[1.6]">
              3 late-game carries with no mid-game win condition
            </div>
          </div>
        </div>
        <div class="flex items-start gap-2.5 py-2.5 border-b border-bd last:border-b-0">
          <div class="text-[17px] shrink-0 mt-0.5">🟡</div>
          <div>
            <div class="text-[12.5px] font-bold mb-0.75">Vision gaps</div>
            <div class="text-[11.5px] text-tx2 line-height-[1.6]">
              No support with reliable ward coverage; vulnerable to smoke ganks
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
