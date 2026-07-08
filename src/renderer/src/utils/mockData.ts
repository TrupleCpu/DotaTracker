export interface MockHero {
  id: number;
  icon: string;
  name: string;
  matches: number;
  winrate: number;
  kda: number;
  gpm: number;
  role: string;
}

export interface MockMatch {
  id: number;
  icon: string;
  hero: string;
  outcome: 'win' | 'loss';
  mode: string;
  k: number;
  d: number;
  a: number;
  gpm: number;
  xpm: number;
  lh: string;
  nw: string;
  dur: string;
  ago: string;
  role: string;
  level: number;
  items: string[];
}

export interface MockTimelineEvent {
  time: string;
  c: string;
  ev: string;
}

export interface MockInsight {
  ico: string;
  c: string;
  ttl: string;
  body: string;
}

export interface MockTeamMember {
  ico: string;
  name: string;
  you: boolean;
  k: number;
  d: number;
  a: number;
  gpm: number;
  nw: string;
}

export interface MockDraftHero {
  icon: string;
  name: string;
  role: string;
}

export interface MockCompareRow {
  label: string;
  left: string;
  right: string;
  lv: number;
  rv: number;
}

export const HEROES: MockHero[] = [
  { id: 1, icon: '🧙', name: 'Pudge', matches: 12, winrate: 66.7, kda: 4.25, gpm: 588, role: 'Core' },
  { id: 2, icon: '👺', name: 'Shadow Fiend', matches: 8, winrate: 62.5, kda: 3.85, gpm: 624, role: 'Mid' },
  { id: 3, icon: '🔥', name: 'Ember Spirit', matches: 6, winrate: 50.0, kda: 3.12, gpm: 571, role: 'Mid' },
  { id: 4, icon: '🦁', name: 'Lion', matches: 5, winrate: 40.0, kda: 2.18, gpm: 311, role: 'Support' },
  { id: 5, icon: '🔮', name: 'Void Spirit', matches: 4, winrate: 75.0, kda: 4.82, gpm: 623, role: 'Mid' },
  { id: 6, icon: '🐉', name: 'Dragon Knight', matches: 4, winrate: 50.0, kda: 2.90, gpm: 487, role: 'Offlane' },
  { id: 7, icon: '👑', name: 'Wraith King', matches: 3, winrate: 66.7, kda: 3.60, gpm: 540, role: 'Core' }
];

function makeMatch(
  id: number, hero: string, icon: string, outcome: 'win' | 'loss', mode: string,
  k: number, d: number, a: number, gpm: number, xpm: number,
  lh: string, nw: string, dur: string, ago: string, role: string,
  level: number, items: string[]
): MockMatch {
  return { id, icon, hero, outcome, mode, k, d, a, gpm, xpm, lh, nw, dur, ago, role, level, items }
}

const H = (name: string): [string, string] => {
  const m: Record<string, [string, string]> = {
    Pudge: ['Pudge', '🧙'], 'Shadow Fiend': ['Shadow Fiend', '👺'], Lion: ['Lion', '🦁'],
    'Void Spirit': ['Void Spirit', '🔮'], 'Ember Spirit': ['Ember Spirit', '🔥'],
    'Dragon Knight': ['Dragon Knight', '🐉'], 'Wraith King': ['Wraith King', '👑'],
    'Phantom Assassin': ['Phantom Assassin', '🗡'], 'Snapfire': ['Snapfire', '🔥'],
    Rubick: ['Rubick', '🔮'], 'Vengeful Spirit': ['Vengeful Spirit', '👻'],
    'Kunkka': ['Kunkka', '⚓'], 'Juggernaut': ['Juggernaut', '⚔️'], 'Tidehunter': ['Tidehunter', '🌊']
  }
  return m[name] ?? [name, '❓']
}

const MODES = ['All Pick', 'Ranked', 'Turbo', 'Ability Draft', 'Random Draft']
const ROLES: [string, string][] = [
  ['Core', 'Core'], ['Mid', 'Mid'], ['Support', 'Support'], ['Offlane', 'Offlane'],
  ['Hard Support', 'Support'], ['Mid', 'Mid'], ['Roaming', 'Support'], ['Safe Lane', 'Core']
]
const ITEM_SETS = [
  ['🗡', '🛡', '💎', '🔮', '⚡', '🧲', '', '', ''],
  ['🔮', '⚡', '💎', '', '', '', '', '', ''],
  ['🛡', '💎', '🔮', '⚡', '', '', '', '', ''],
  ['⚡', '🔮', '🧲', '🗡', '💎', '', '', '', ''],
  ['🗡', '⚡', '🔮', '💎', '🛡', '', '', '', ''],
  ['🛡', '🗡', '⚡', '🔮', '💎', '🧲', '', '', ''],
  ['🗡', '🛡', '💎', '⚡', '🔮', '🧲', '🪄', '', ''],
  ['💎', '🔮', '🛡', '🗡', '', '', '', '', ''],
]
const AGOS = [
  '2 hours ago', '1 day ago', '2 days ago', '3 days ago', '4 days ago',
  '5 days ago', '1 week ago', '2 weeks ago', '3 weeks ago', '1 month ago',
  '2 months ago', '3 months ago', '6 hours ago', '12 hours ago', '30m ago'
]
const GPM_RANGE: Record<string, [number, number]> = {
  Core: [500, 650], Mid: [480, 640], Support: [200, 380], Offlane: [400, 540],
  'Hard Support': [180, 320], 'Safe Lane': [510, 660], Roaming: [220, 360]
}

const heroes = ['Pudge', 'Shadow Fiend', 'Lion', 'Void Spirit', 'Ember Spirit', 'Dragon Knight', 'Wraith King',
  'Phantom Assassin', 'Snapfire', 'Rubick', 'Vengeful Spirit', 'Kunkka', 'Juggernaut', 'Tidehunter']

function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }

export const MATCHES: MockMatch[] = (() => {
  const results: MockMatch[] = [
    makeMatch(1, ...H('Pudge'), 'win', 'All Pick', 8, 4, 16, 612, 701, '145/6', '18,340', '34:21', '2 hours ago', 'Core', 18, ['🗡', '🛡', '💎', '🔮', '⚡', '🧲', '🪄', '', '']),
    makeMatch(2, ...H('Shadow Fiend'), 'loss', 'All Pick', 2, 7, 8, 430, 510, '102/2', '11,200', '28:14', '1 day ago', 'Mid', 14, ['🔮', '⚡', '', '', '', '', '', '', '']),
    makeMatch(3, ...H('Lion'), 'win', 'All Pick', 11, 3, 8, 290, 380, '24/5', '9,800', '32:09', '2 days ago', 'Support', 16, ['🛡', '💎', '🔮', '', '', '', '', '', '']),
    makeMatch(4, ...H('Void Spirit'), 'win', 'All Pick', 6, 2, 14, 598, 655, '134/4', '17,100', '26:31', '3 days ago', 'Mid', 17, ['⚡', '🔮', '🧲', '🗡', '', '', '', '', '']),
    makeMatch(5, ...H('Ember Spirit'), 'loss', 'All Pick', 4, 6, 9, 510, 560, '118/3', '13,400', '41:22', '4 days ago', 'Mid', 19, ['🗡', '⚡', '🔮', '💎', '', '', '', '', '']),
    makeMatch(6, ...H('Dragon Knight'), 'win', 'Ranked', 9, 2, 11, 520, 600, '160/7', '20,100', '38:45', '5 days ago', 'Offlane', 20, ['🛡', '🗡', '⚡', '🔮', '💎', '', '', '', '']),
    makeMatch(7, ...H('Wraith King'), 'win', 'All Pick', 7, 3, 13, 555, 620, '148/5', '18,800', '36:10', '5 days ago', 'Core', 19, ['🗡', '🛡', '💎', '⚡', '🔮', '🧲', '', '', '']),
  ]

  let id = 8
  for (let i = 0; i < 53; i++) {
    const hero = heroes[i % heroes.length]
    const [heroName, icon] = H(hero)
    const outcome: 'win' | 'loss' = Math.random() < 0.55 ? 'win' : 'loss'
    const mode = MODES[randInt(0, MODES.length - 1)]
    const [role, _] = ROLES[randInt(0, ROLES.length - 1)]
    const [gpmLo, gpmHi] = GPM_RANGE[role] ?? [300, 600]
    const gpm = randInt(gpmLo, gpmHi)
    const xpm = randInt(gpm - 80, gpm + 120)
    const k = randInt(1, 14)
    const d = randInt(1, 10)
    const a = randInt(3, 20)
    const lh = `${randInt(20, 200)}/${randInt(0, 10)}`
    const nw = `${randInt(8, 25)},${randInt(0, 99).toString().padStart(2, '0')}`
    const min = randInt(20, 55)
    const sec = randInt(0, 59).toString().padStart(2, '0')
    const dur = `${min}:${sec}`
    const ago = AGOS[randInt(0, AGOS.length - 1)]
    const level = randInt(12, 30)
    const items = ITEM_SETS[randInt(0, ITEM_SETS.length - 1)]

    results.push(makeMatch(id, icon, heroName, outcome, mode, k, d, a, gpm, xpm, lh, nw, dur, ago, role, level, items))
    id++
  }

  return results
})()

export const TIMELINE: MockTimelineEvent[] = [
  { time: '03:12', c: '#22C55E', ev: 'First Blood — <span class="text-gr font-bold">Pudge</span> kills Shadow Fiend' },
  { time: '05:40', c: '#4A5270', ev: 'Bounty Rune secured ×2' },
  { time: '06:44', c: '#F04545', ev: 'Dire Tower Bottom <span class="text-rd font-bold">destroyed</span>' },
  { time: '10:41', c: '#F59E0B', ev: '<span class="text-gd font-bold">Roshan</span> has spawned' },
  { time: '12:18', c: '#F04545', ev: 'Dire Tower Mid <span class="text-rd font-bold">destroyed</span>' },
  { time: '14:03', c: '#22C55E', ev: '<span class="text-gr font-bold">Radiant</span> triple kill — outstanding!' },
  { time: '17:30', c: '#4A5270', ev: 'Barracks race begins' },
  { time: '20:17', c: '#F59E0B', ev: '<span class="text-gd font-bold">Roshan Killed</span> by Radiant — Aegis secured' },
  { time: '22:31', c: '#F04545', ev: 'Dire Tower Bottom <span class="text-rd font-bold">destroyed</span>' },
  { time: '29:45', c: '#F04545', ev: 'Dire Barracks Top <span class="text-rd font-bold">destroyed</span>' },
  { time: '31:02', c: '#F04545', ev: 'Dire Barracks Bottom <span class="text-rd font-bold">destroyed</span>' },
  { time: '34:21', c: '#22C55E', ev: '<span class="text-gr font-bold">Dire Ancient Destroyed</span> — Radiant Victory!' }
];

export const INSIGHTS: MockInsight[] = [
  { ico: '🟢', c: '#22C55E', ttl: 'Great Engagement', body: '42% kill participation — 10 pts above your average of 32%. Keep prioritizing teamfights.' },
  { ico: '🟡', c: '#F59E0B', ttl: 'Good Item Timing', body: 'Blink Dagger at 11:26 min — 2 minutes ahead of your 30-game average. Nice.' },
  { ico: '🔴', c: '#F04545', ttl: 'Early Deaths', body: 'Died 2 times before 10 min. Play safer in lane and respect enemy cooldowns.' },
  { ico: '🔵', c: '#38BDF8', ttl: 'Hook Accuracy', body: '38% this game — above your 30-game average of 33%. Trending upward.' }
];

export const TEAM_DATA: MockTeamMember[] = [
  { ico: '🧙', name: 'Pudge', you: true, k: 8, d: 4, a: 16, gpm: 612, nw: '18.3k' },
  { ico: '👺', name: 'Shadow Fiend', you: false, k: 5, d: 5, a: 10, gpm: 590, nw: '17.1k' },
  { ico: '🐉', name: 'Dragon Knight', you: false, k: 3, d: 4, a: 14, gpm: 480, nw: '14.2k' },
  { ico: '🦁', name: 'Lion', you: false, k: 2, d: 6, a: 20, gpm: 290, nw: '9.8k' },
  { ico: '👑', name: 'Wraith King', you: false, k: 4, d: 2, a: 18, gpm: 520, nw: '15.9k' }
];

export const RADIANT: MockDraftHero[] = [
  { icon: '🧙', name: 'Pudge', role: 'Roaming Support' },
  { icon: '👺', name: 'Shadow Fiend', role: 'Mid Core' },
  { icon: '🐉', name: 'Dragon Knight', role: 'Offlane' },
  { icon: '👑', name: 'Wraith King', role: 'Safe Lane Carry' },
  { icon: '🦁', name: 'Lion', role: 'Hard Support' }
];

export const DIRE: (MockDraftHero | null)[] = [
  { icon: '🔮', name: 'Void Spirit', role: 'Mid Core' },
  { icon: '🔥', name: 'Ember Spirit', role: 'Roaming' },
  { icon: '⚔️', name: 'Juggernaut', role: 'Carry' },
  { icon: '🌊', name: 'Tidehunter', role: 'Offlane' },
  null
];

export const CMP: MockCompareRow[] = [
  { label: 'Win Rate', left: '57.1%', right: '52.3%', lv: 57, rv: 52 },
  { label: 'KDA', left: '3.45', right: '3.12', lv: 69, rv: 62 },
  { label: 'GPM', left: '542', right: '498', lv: 54, rv: 50 },
  { label: 'Hook Acc.', left: '38%', right: '31%', lv: 76, rv: 62 },
  { label: 'Participation', left: '42%', right: '38%', lv: 55, rv: 50 },
  { label: 'Matches', left: '127', right: '84', lv: 60, rv: 40 }
];
