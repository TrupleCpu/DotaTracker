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

export const MATCHES: MockMatch[] = [
  { id: 1, icon: '🧙', hero: 'Pudge', outcome: 'win', mode: 'All Pick', k: 8, d: 4, a: 16, gpm: 612, xpm: 701, lh: '145/6', nw: '18,340', dur: '34:21', ago: '2 hours ago', role: 'Core', level: 18, items: ['🗡', '🛡', '💎', '🔮', '⚡', '🧲', '🪄', '', ''] },
  { id: 2, icon: '👺', hero: 'Shadow Fiend', outcome: 'loss', mode: 'All Pick', k: 2, d: 7, a: 8, gpm: 430, xpm: 510, lh: '102/2', nw: '11,200', dur: '28:14', ago: '1 day ago', role: 'Mid', level: 14, items: ['🔮', '⚡', '', '', '', '', '', '', ''] },
  { id: 3, icon: '🦁', hero: 'Lion', outcome: 'win', mode: 'All Pick', k: 11, d: 3, a: 8, gpm: 290, xpm: 380, lh: '24/5', nw: '9,800', dur: '32:09', ago: '2 days ago', role: 'Support', level: 16, items: ['🛡', '💎', '🔮', '', '', '', '', '', ''] },
  { id: 4, icon: '🔮', hero: 'Void Spirit', outcome: 'win', mode: 'All Pick', k: 6, d: 2, a: 14, gpm: 598, xpm: 655, lh: '134/4', nw: '17,100', dur: '26:31', ago: '3 days ago', role: 'Mid', level: 17, items: ['⚡', '🔮', '🧲', '🗡', '', '', '', '', ''] },
  { id: 5, icon: '🔥', hero: 'Ember Spirit', outcome: 'loss', mode: 'All Pick', k: 4, d: 6, a: 9, gpm: 510, xpm: 560, lh: '118/3', nw: '13,400', dur: '41:22', ago: '4 days ago', role: 'Mid', level: 19, items: ['🗡', '⚡', '🔮', '💎', '', '', '', '', ''] },
  { id: 6, icon: '🐉', hero: 'Dragon Knight', outcome: 'win', mode: 'Ranked', k: 9, d: 2, a: 11, gpm: 520, xpm: 600, lh: '160/7', nw: '20,100', dur: '38:45', ago: '5 days ago', role: 'Offlane', level: 20, items: ['🛡', '🗡', '⚡', '🔮', '💎', '', '', '', ''] },
  { id: 7, icon: '👑', hero: 'Wraith King', outcome: 'win', mode: 'All Pick', k: 7, d: 3, a: 13, gpm: 555, xpm: 620, lh: '148/5', nw: '18,800', dur: '36:10', ago: '5 days ago', role: 'Core', level: 19, items: ['🗡', '🛡', '💎', '⚡', '🔮', '🧲', '', '', ''] }
];

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
