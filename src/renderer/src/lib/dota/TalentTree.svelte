<script lang="ts">
  import talentSlots from '../../../../main/data/heroTalents.json'
  import allAbilities from '../../../../main/data/abilities.json'
  import type { AbilityHeroEntry } from '../../types/matchDetail'
  import { SvelteSet } from 'svelte/reactivity'

  let {
    abilities,
    heroId,
    level
  }: { abilities: AbilityHeroEntry[]; heroId: number; level?: number } = $props()

  let _gid = 0
  // svelte-ignore state_referenced_locally
  const uid = `tt-${++_gid}-${heroId}`

  const abilityNameMap = $derived(
    new Map(
      (allAbilities as { id: number; language: { displayName: string | null } }[])
        .map((a) => [a.id, a.language?.displayName])
        .filter((kv): kv is [number, string] => kv[1] != null)
    )
  )

  const heroTalentData = $derived(
    (
      talentSlots as {
        id: number
        displayName: string
        talents: { abilityId: number; slot: number }[]
      }[]
    ).find((h) => h.id === heroId)
  )
  const heroTalents = $derived(heroTalentData?.talents ?? [])
  const talentSlotMap = $derived(new Map(heroTalents.map((t) => [t.abilityId, t.slot])))

  const DOT_PATHS = [
    'M3.258 23.38c.295-.22.624-.303.992-.238.362.057.651.235.868.536.217.3.298.634.243 1.002-.05.376-.225.67-.52.891a1.24 1.24 0 01-1.002.244 1.275 1.275 0 01-.868-.535 1.315 1.315 0 01-.242-1.002c.05-.377.225-.671.529-.898z',
    'M6.244 26.987c.215-.301.503-.482.873-.534.361-.06.69.02.988.24.297.218.474.51.532.878.067.374-.012.708-.227 1.01-.221.31-.51.491-.88.544a1.263 1.263 0 01-.987-.24 1.302 1.302 0 01-.533-.879 1.291 1.291 0 01.234-1.019z',
    'M10.17 29.492c.114-.355.333-.617.669-.783a1.26 1.26 0 011.012-.082c.349.115.607.338.773.669.177.335.204.677.091 1.032a1.27 1.27 0 01-.671.793 1.26 1.26 0 01-1.012.082 1.284 1.284 0 01-.774-.669 1.294 1.294 0 01-.087-1.042z',
    'M14.684 30.638c0-.373.129-.69.398-.954.258-.264.57-.396.938-.396.366 0 .68.13.938.393.27.262.4.58.4.953.002.383-.127.701-.397.965a1.268 1.268 0 01-.937.396c-.367 0-.68-.13-.939-.393-.27-.263-.4-.58-.4-.964z',
    'M19.302 30.322a1.287 1.287 0 01.09-1.032c.165-.331.423-.555.771-.67a1.26 1.26 0 011.013.08c.336.166.556.428.67.782.116.365.09.708-.087 1.043a1.284 1.284 0 01-.772.67 1.26 1.26 0 01-1.013-.08 1.27 1.27 0 01-.672-.793z',
    'M23.614 28.564a1.284 1.284 0 01-.23-1.01c.058-.367.234-.66.53-.88.297-.219.626-.3.988-.241.37.051.659.231.874.532.223.31.302.645.236 1.019-.057.367-.234.66-.53.88-.297.219-.626.3-.988.241a1.252 1.252 0 01-.88-.541z',
    'M27.184 25.537a1.272 1.272 0 01-.523-.89 1.316 1.316 0 01.24-1.002c.215-.302.504-.48.866-.538.368-.067.697.015.993.234.305.226.481.52.531.896.057.368-.023.702-.239 1.003-.216.301-.505.48-.866.538a1.24 1.24 0 01-1.002-.241z'
  ]
  const DOT_UNCHOSEN_FILL = [
    'hsl(0,0%,28%)',
    'hsl(0,0%,28%)',
    'hsl(0,0%,28%)',
    'hsl(0,0%,28%)',
    'hsl(0,0%,28%)',
    'hsl(0,0%,28%)',
    'hsla(0,0%,100%,0.12)'
  ]

  const DOT_SLOTS = [0, 1, 2, 3, 4, 5, 6]

  const BRANCHES = [
    {
      slot: 0,
      gradId: 'l-1',
      d: 'M0.013,44.716c0,0,6.586,6.584,9.823,6.805c3.236,0.224,7.033,0,7.033,0s7.024,1.732,7.024,7.368V63 l3.195-0.014c0,0,0-3.782,0-5.571c0-6.857-10.053-7.567-10.053-7.567S11.957,41.979,0.013,44.716z'
    },
    {
      slot: 1,
      gradId: 'r-1',
      d: 'M51,44.716c0,0-6.586,6.584-9.823,6.805c-3.235,0.224-7.032,0-7.032,0s-7.024,1.732-7.024,7.368V63 l-3.195-0.014c0,0,0-3.782,0-5.571c0-6.857,10.052-7.567,10.052-7.567S39.057,41.979,51,44.716z'
    },
    {
      slot: 2,
      gradId: 'l-2',
      d: 'M0,30.326c0,0,5.744,9.07,9.516,9.495c3.1,0.348,6.542,0.107,8.122,0.262 c3.068,0.301,6.256,1.351,6.256,5.667V63h3.181c0,0,0-17.488,0-18.454c0-0.964,0.006-5.235,7.093-6.584 c-1.207-0.232-3.687-0.281-4.913-0.281C15.068,37.681,10.547,29.951,0,30.326z'
    },
    {
      slot: 3,
      gradId: 'r-2',
      d: 'M51,30.326c0,0-5.745,9.07-9.517,9.495c-3.1,0.348-6.542,0.107-8.12,0.262 c-3.069,0.301-6.257,1.351-6.257,5.667V63h-3.182c0,0,0-17.488,0-18.454c0-0.964,0.006-5.235,7.093-6.584 c1.208-0.232,3.688-0.281,4.913-0.281C35.931,37.681,40.451,29.951,51,30.326z'
    },
    {
      slot: 4,
      gradId: 'l-3',
      d: 'M4.031,16.042c0,0,0.669,3.435,2.899,6.315c2.232,2.878,4.147,4.891,6.489,4.891 c2.344,0,6.208-0.01,7.68,0.868c1.837,1.095,2.803,3.213,2.803,5.373c0,0.976,0,29.511,0,29.511h3.173V33.489 c0,0-0.085-3.859-3.102-6.426c-1.651-1.405-2.911-2.141-5.294-2.141c-0.908,0-2.041-0.019-2.041-0.019s-1.785-4.153-5.188-6.203 C8.046,16.651,4.031,16.042,4.031,16.042z'
    },
    {
      slot: 5,
      gradId: 'r-3',
      d: 'M46.969,16.042c0,0-0.669,3.435-2.898,6.315c-2.232,2.878-4.147,4.891-6.489,4.891 c-2.344,0-6.208-0.01-7.68,0.868c-1.837,1.095-2.803,3.213-2.803,5.373c0,0.976,0,29.511,0,29.511h-3.174V33.489 c0,0,0.086-3.859,3.103-6.426c1.651-1.405,2.911-2.141,5.295-2.141c0.907,0,2.041-0.019,2.041-0.019s1.785-4.153,5.187-6.203 C42.954,16.651,46.969,16.042,46.969,16.042z'
    },
    {
      slot: 6,
      gradId: 'copper',
      d: 'M11.033,0c0,0-0.802,7.891,2.625,11.654c3.426,3.761,5.55,2.683,7.765,3.097 c1.969,0.369,2.479,1.772,2.479,3.984c0,2.212,0,44.209,0,44.209h3.101c0,0,0.072-43.305,0.072-44.209 c0-0.905-0.019-4.906-3.792-6.115c-1.592-0.509-2.334-0.376-2.918-2.293C19.782,8.408,17.96,1.99,11.033,0z'
    },
    {
      slot: 7,
      gradId: 'r-4',
      d: 'M39.967,0c0,0,0.803,7.891-2.625,11.654c-3.426,3.761-5.551,2.683-7.765,3.097 c-1.969,0.369-2.479,1.772-2.479,3.984c0,2.212,0,44.209,0,44.209h-3.101c0,0-0.073-43.305-0.073-44.209 c0-0.905,0.02-4.906,3.793-6.115c1.592-0.509,2.335-0.376,2.917-2.293C31.218,8.408,33.04,1.99,39.967,0z'
    }
  ]

  const selectedSlots = $derived.by(() => {
    const slots = new SvelteSet<number>()
    for (const a of abilities ?? []) {
      const isTalent = a.isTalent ?? a.abilityType?.isTalent ?? false
      if (!isTalent) continue
      const slot = talentSlotMap.get(a.abilityId)
      if (slot !== undefined) slots.add(slot)
    }
    return slots
  })

  const talentDots = $derived(DOT_SLOTS.map((_, i) => i < selectedSlots.size))

  const expectedTalentCount = $derived.by(() => {
    if (level == null) return null
    if (level >= 25) return 4
    if (level >= 20) return 3
    if (level >= 15) return 2
    if (level >= 10) return 1
    return 0
  })

  const matchedTalentCount = $derived(selectedSlots.size)

  const diagnostic = $derived.by(() => {
    if (level == null) return null
    const allAbilitiesArr = abilities ?? []
    const talentAbilityIds = allAbilitiesArr
      .filter((a) => a.isTalent ?? a.abilityType?.isTalent ?? false)
      .map((a) => a.abilityId)
    const matchedIds = new SvelteSet<number>()
    for (const aid of talentAbilityIds) {
      const slot = talentSlotMap.get(aid)
      if (slot !== undefined) matchedIds.add(aid)
    }
    return {
      level,
      totalAbilities: allAbilitiesArr.length,
      talentAbilities: talentAbilityIds.length,
      abilityIds: talentAbilityIds,
      matchedAbilityIds: [...matchedIds],
      heroTalentsCount: heroTalents.length,
      expectedTalentCount,
      matchedTalentCount
    }
  })

  $effect(() => {
    if (diagnostic) {
      console.debug('[TalentTree]', heroTalentData?.displayName ?? 'hero-' + heroId, diagnostic)
    }
  })

  let isHovered = $state(false)
  let hoverTimer: ReturnType<typeof setTimeout> | undefined

  function show(): void {
    clearTimeout(hoverTimer)
    isHovered = true
  }

  function hide(): void {
    hoverTimer = setTimeout(() => {
      isHovered = false
    }, 150)
  }

  function cleanName(name: string): string {
    return name
      .replace(/\{s:[^}]+}(s|%|x)?/g, '')
      .replace(/[+]\s+/g, '+')
      .replace(/-\s+/g, '-')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const LEVELS_CONFIG = [
    { level: 25, leftSlot: 6, rightSlot: 7 },
    { level: 20, leftSlot: 4, rightSlot: 5 },
    { level: 15, leftSlot: 2, rightSlot: 3 },
    { level: 10, leftSlot: 0, rightSlot: 1 }
  ]

  const levelRows = $derived(
    LEVELS_CONFIG.map(({ level, leftSlot, rightSlot }) => {
      const leftTalent = heroTalents.find((t) => t.slot === leftSlot)
      const rightTalent = heroTalents.find((t) => t.slot === rightSlot)
      return {
        level,
        leftName: leftTalent ? cleanName(abilityNameMap.get(leftTalent.abilityId) ?? '-') : '',
        leftPicked: leftTalent ? selectedSlots.has(leftSlot) : false,
        rightName: rightTalent ? cleanName(abilityNameMap.get(rightTalent.abilityId) ?? '-') : '',
        rightPicked: rightTalent ? selectedSlots.has(rightSlot) : false
      }
    })
  )
</script>

<div class="relative inline-flex" onmouseenter={show} onmouseleave={hide} role="img">
  <svg viewBox="0 0 32 32" height="44" class="shrink-0 cursor-help">
    <defs>
      <linearGradient
        id="{uid}-copper"
        gradientUnits="userSpaceOnUse"
        x1="-43.2212"
        y1="40.4932"
        x2="-20.5475"
        y2="63.1668"
        gradientTransform="matrix(1 0 0 1 47.457 0)"
      >
        <stop offset="0.1257" style="stop-color: rgb(231, 189, 118);"></stop>
        <stop offset="0.1298" style="stop-color: rgb(230, 187, 116);"></stop>
        <stop offset="0.2466" style="stop-color: rgb(212, 142, 78);"></stop>
        <stop offset="0.3335" style="stop-color: rgb(204, 117, 59);"></stop>
        <stop offset="0.3803" style="stop-color: rgb(201, 108, 53);"></stop>
        <stop offset="0.8908" style="stop-color: rgb(201, 109, 52);"></stop>
        <stop offset="0.9078" style="stop-color: rgb(204, 116, 57);"></stop>
        <stop offset="0.9366" style="stop-color: rgb(210, 134, 71);"></stop>
        <stop offset="0.9734" style="stop-color: rgb(222, 167, 99);"></stop>
        <stop offset="0.9891" style="stop-color: rgb(229, 185, 114);"></stop>
      </linearGradient>
      <linearGradient
        id="{uid}-r-1"
        gradientUnits="userSpaceOnUse"
        x1="-19.9316"
        y1="40.4932"
        x2="2.7414"
        y2="63.1662"
        gradientTransform="matrix(-1 0 0 1 26.8457 0)"
      >
        <stop offset="0.1257" style="stop-color: rgb(231, 189, 118);"></stop>
        <stop offset="0.1298" style="stop-color: rgb(230, 187, 116);"></stop>
        <stop offset="0.2466" style="stop-color: rgb(212, 142, 78);"></stop>
        <stop offset="0.3335" style="stop-color: rgb(204, 117, 59);"></stop>
        <stop offset="0.3803" style="stop-color: rgb(201, 108, 53);"></stop>
        <stop offset="0.8908" style="stop-color: rgb(201, 109, 52);"></stop>
        <stop offset="0.9078" style="stop-color: rgb(204, 116, 57);"></stop>
        <stop offset="0.9366" style="stop-color: rgb(210, 134, 71);"></stop>
        <stop offset="0.9734" style="stop-color: rgb(222, 167, 99);"></stop>
        <stop offset="0.9891" style="stop-color: rgb(229, 185, 114);"></stop>
      </linearGradient>
      <linearGradient
        id="{uid}-r-2"
        gradientUnits="userSpaceOnUse"
        x1="-21.8032"
        y1="28.7007"
        x2="8.0713"
        y2="58.5753"
        gradientTransform="matrix(-1 0 0 1 27.5703 0)"
      >
        <stop offset="0.0938" style="stop-color: rgb(231, 189, 118);"></stop>
        <stop offset="0.3301" style="stop-color: rgb(201, 108, 53);"></stop>
        <stop offset="0.5241" style="stop-color: rgb(201, 110, 54);"></stop>
        <stop offset="0.6135" style="stop-color: rgb(203, 115, 57);"></stop>
        <stop offset="0.6814" style="stop-color: rgb(206, 124, 64);"></stop>
        <stop offset="0.7385" style="stop-color: rgb(210, 136, 74);"></stop>
        <stop offset="0.7888" style="stop-color: rgb(217, 154, 89);"></stop>
        <stop offset="0.8337" style="stop-color: rgb(226, 178, 108);"></stop>
        <stop offset="0.844" style="stop-color: rgb(229, 185, 114);"></stop>
        <stop offset="1" style="stop-color: rgb(242, 214, 139);"></stop>
      </linearGradient>
      <linearGradient
        id="{uid}-l-3"
        gradientUnits="userSpaceOnUse"
        x1="6.6157"
        y1="14.5508"
        x2="32.7095"
        y2="59.7465"
      >
        <stop offset="0.0938" style="stop-color: rgb(231, 189, 118);"></stop>
        <stop offset="0.2261" style="stop-color: rgb(201, 108, 53);"></stop>
        <stop offset="0.3757" style="stop-color: rgb(201, 110, 54);"></stop>
        <stop offset="0.4915" style="stop-color: rgb(204, 117, 59);"></stop>
        <stop offset="0.5961" style="stop-color: rgb(208, 129, 67);"></stop>
        <stop offset="0.694" style="stop-color: rgb(213, 145, 81);"></stop>
        <stop offset="0.7864" style="stop-color: rgb(222, 169, 101);"></stop>
        <stop offset="0.8335" style="stop-color: rgb(229, 185, 114);"></stop>
        <stop offset="1" style="stop-color: rgb(242, 214, 139);"></stop>
      </linearGradient>
      <linearGradient
        id="{uid}-r-4"
        gradientUnits="userSpaceOnUse"
        x1="-7.8799"
        y1="3.667"
        x2="23.3677"
        y2="57.7894"
        gradientTransform="matrix(-1 0 0 1 38.4375 0)"
      >
        <stop offset="0.0938" style="stop-color: rgb(231, 189, 118);"></stop>
        <stop offset="0.2261" style="stop-color: rgb(201, 108, 53);"></stop>
        <stop offset="0.3141" style="stop-color: rgb(202, 113, 56);"></stop>
        <stop offset="0.4401" style="stop-color: rgb(207, 126, 65);"></stop>
        <stop offset="0.5891" style="stop-color: rgb(215, 148, 84);"></stop>
        <stop offset="0.7544" style="stop-color: rgb(228, 183, 113);"></stop>
        <stop offset="0.7585" style="stop-color: rgb(229, 185, 114);"></stop>
        <stop offset="1" style="stop-color: rgb(242, 214, 139);"></stop>
      </linearGradient>
      <linearGradient
        id="{uid}-l-1"
        gradientUnits="userSpaceOnUse"
        x1="-43.2212"
        y1="40.4932"
        x2="-20.5475"
        y2="63.1668"
        gradientTransform="matrix(1 0 0 1 47.457 0)"
      >
        <stop offset="0.1257" style="stop-color: rgb(231, 189, 118);"></stop>
        <stop offset="0.1298" style="stop-color: rgb(230, 187, 116);"></stop>
        <stop offset="0.2466" style="stop-color: rgb(212, 142, 78);"></stop>
        <stop offset="0.3335" style="stop-color: rgb(204, 117, 59);"></stop>
        <stop offset="0.3803" style="stop-color: rgb(201, 108, 53);"></stop>
        <stop offset="0.8908" style="stop-color: rgb(201, 109, 52);"></stop>
        <stop offset="0.9078" style="stop-color: rgb(204, 116, 57);"></stop>
        <stop offset="0.9366" style="stop-color: rgb(210, 134, 71);"></stop>
        <stop offset="0.9734" style="stop-color: rgb(222, 167, 99);"></stop>
        <stop offset="0.9891" style="stop-color: rgb(229, 185, 114);"></stop>
      </linearGradient>
      <linearGradient
        id="{uid}-l-2"
        gradientUnits="userSpaceOnUse"
        x1="1.6265"
        y1="28.7007"
        x2="31.5003"
        y2="58.5746"
      >
        <stop offset="0.0938" style="stop-color: rgb(231, 189, 118);"></stop>
        <stop offset="0.2261" style="stop-color: rgb(201, 108, 53);"></stop>
        <stop offset="0.3757" style="stop-color: rgb(201, 110, 54);"></stop>
        <stop offset="0.4915" style="stop-color: rgb(204, 117, 59);"></stop>
        <stop offset="0.5961" style="stop-color: rgb(208, 129, 67);"></stop>
        <stop offset="0.694" style="stop-color: rgb(213, 145, 81);"></stop>
        <stop offset="0.7864" style="stop-color: rgb(222, 169, 101);"></stop>
        <stop offset="0.8335" style="stop-color: rgb(229, 185, 114);"></stop>
        <stop offset="1" style="stop-color: rgb(242, 214, 139);"></stop>
      </linearGradient>
      <linearGradient
        id="{uid}-r-3"
        gradientUnits="userSpaceOnUse"
        x1="-12.814"
        y1="14.5498"
        x2="13.2803"
        y2="59.7464"
        gradientTransform="matrix(-1 0 0 1 31.5703 0)"
      >
        <stop offset="0.0938" style="stop-color: rgb(231, 189, 118);"></stop>
        <stop offset="0.2261" style="stop-color: rgb(201, 108, 53);"></stop>
        <stop offset="0.3757" style="stop-color: rgb(201, 110, 54);"></stop>
        <stop offset="0.4915" style="stop-color: rgb(204, 117, 59);"></stop>
        <stop offset="0.5961" style="stop-color: rgb(208, 129, 67);"></stop>
        <stop offset="0.694" style="stop-color: rgb(213, 145, 81);"></stop>
        <stop offset="0.7864" style="stop-color: rgb(222, 169, 101);"></stop>
        <stop offset="0.8335" style="stop-color: rgb(229, 185, 114);"></stop>
        <stop offset="1" style="stop-color: rgb(242, 214, 139);"></stop>
      </linearGradient>
    </defs>

    <svg viewBox="0 0 51 63" height="25" y="3.8" style="width: 100%; height: 100%;">
      {#each BRANCHES as b (b.slot)}
        <path
          d={b.d}
          fill={selectedSlots.has(b.slot) ? `url(#${uid}-${b.gradId})` : 'hsl(0,0%,28%)'}
        />
      {/each}
    </svg>

    {#each DOT_PATHS as d, i (i)}
      <path {d} fill={talentDots[i] ? `url(#${uid}-copper)` : DOT_UNCHOSEN_FILL[i]} />
    {/each}

    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M1.974 21.886a15.733 15.733 0 01-1.307-6.302C.667 6.983 7.537 0 16 0c8.463 0 15.333 6.983 15.333 15.584 0 2.226-.46 4.343-1.288 6.259a3.35 3.35 0 00-.942-.549 14.626 14.626 0 001.152-5.71c0-7.996-6.387-14.488-14.255-14.488-7.867 0-14.255 6.492-14.255 14.488 0 2.042.417 3.986 1.169 5.75a3.36 3.36 0 00-.94.552z"
      fill="hsla(0,0%,100%,0.12)"
    />
  </svg>

  {#if isHovered}
    <div
      class="absolute left-0 bottom-full mb-1 z-50"
      onmouseenter={show}
      onmouseleave={hide}
      role="tooltip"
    >
      <div
        class="bg-zinc-950 border border-zinc-800 rounded-lg p-3 shadow-2xl min-w-75 shadow-black/50"
      >
        {#if heroTalentData}
          <div class="flex items-center justify-between mb-2 pb-2 border-b border-zinc-800">
            <span class="text-xs font-bold text-zinc-200">{heroTalentData.displayName}</span>
            {#if level != null}
              <span class="text-xxs text-zinc-500">Level {level}</span>
            {/if}
          </div>
        {/if}

        <div class="space-y-1">
          {#each levelRows as row (row.level)}
            <div class="grid grid-cols-[1fr_auto_1fr] gap-x-3 items-center">
              <span
                class="text-right text-xs leading-snug"
                class:text-amber-400={row.leftPicked}
                class:text-zinc-500={!row.leftPicked}
                class:font-semibold={row.leftPicked}>{row.leftName}</span
              >

              <div class="flex items-center gap-0.5">
                <div class="w-4 h-px bg-zinc-700"></div>
                <span class="text-xxs text-zinc-600 font-mono w-4 text-center">{row.level}</span>
                <div class="w-4 h-px bg-zinc-700"></div>
              </div>

              <span
                class="text-left text-xs leading-snug"
                class:text-amber-400={row.rightPicked}
                class:text-zinc-500={!row.rightPicked}
                class:font-semibold={row.rightPicked}>{row.rightName}</span
              >
            </div>
          {/each}
        </div>

        {#if diagnostic && matchedTalentCount !== expectedTalentCount}
          <div
            class="mt-2 pt-2 border-t border-zinc-800 flex items-center gap-1 text-amber-400 text-xxs"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" class="shrink-0">
              <path
                d="M4 0C1.8 0 0 1.8 0 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm.5 6h-1V5h1v1zm0-2h-1V2h1v2z"
              />
            </svg>
            <span
              >Expected {expectedTalentCount} talents at level {level}, got {matchedTalentCount}</span
            >
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
