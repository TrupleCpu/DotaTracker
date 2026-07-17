import { loadLlmConfig } from './configService'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ProviderConfig {
  baseUrl: string
  headers: Record<string, string>
  formatBody: (messages: ChatMessage[], model: string) => unknown
  parseResponse: (json: any) => string
}

const DEFAULT_MODELS: Record<string, string> = {
  openai: 'gpt-4o-mini',
  nvidia: 'meta/llama-3.1-8b-instruct',
  claude: 'claude-3-5-haiku-latest',
  gemini: 'gemini-2.0-flash',
  groq: 'llama-3.3-70b-versatile'
}

function getProviderConfig(): ProviderConfig | null {
  const cfg = loadLlmConfig()
  if (!cfg || !cfg.apiKey) return null

  const base = cfg.baseUrl?.replace(/\/+$/, '')

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  switch (cfg.provider) {
    case 'openai':
    case 'nvidia':
    case 'groq':
      headers['Authorization'] = `Bearer ${cfg.apiKey}`
      return {
        baseUrl: base || (
          cfg.provider === 'nvidia' ? 'https://integrate.api.nvidia.com/v1' :
          cfg.provider === 'groq' ? 'https://api.groq.com/openai/v1' :
          'https://api.openai.com/v1'
        ),
        headers,
        formatBody: (messages, model) => ({
          model,
          messages,
          max_tokens: 1024,
          response_format: { type: 'json_object' }
        }),
        parseResponse: (json) => json.choices?.[0]?.message?.content ?? ''
      }
    case 'claude': {
      const baseUrl = base || 'https://api.anthropic.com/v1'
      return {
        baseUrl,
        headers: { ...headers, 'x-api-key': cfg.apiKey, 'anthropic-version': '2023-06-01' },
        formatBody: (messages, model) => {
          const system = messages.find((m) => m.role === 'system')?.content
          const msgs = messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role, content: m.content }))
          return { model, messages: msgs, ...(system ? { system } : {}), max_tokens: 1024 }
        },
        parseResponse: (json) => json.content?.[0]?.text ?? ''
      }
    }
    case 'gemini': {
      const baseUrl = base || 'https://generativelanguage.googleapis.com/v1beta/openai'
      headers['Authorization'] = `Bearer ${cfg.apiKey}`
      return {
        baseUrl,
        headers,
        formatBody: (messages, model) => ({
          model,
          messages,
          max_tokens: 1024,
          response_format: { type: 'json_object' }
        }),
        parseResponse: (json) => json.choices?.[0]?.message?.content ?? ''
      }
    }
    default:
      return null
  }
}

function extractJson(text: string): string {
  const firstBrace = text.indexOf('{')
  const firstBracket = text.indexOf('[')

  let start = -1
  let end = -1

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    // Expected structure is JSON object
    start = firstBrace
    end = text.lastIndexOf('}')
  } else if (firstBracket !== -1) {
    // Expected structure is JSON array
    start = firstBracket
    end = text.lastIndexOf(']')
  }

  if (start !== -1 && end !== -1 && end > start) {
    return text.substring(start, end + 1)
  }

  return text.trim()
}

async function llmChat(messages: ChatMessage[]): Promise<string> {
  const cfg = loadLlmConfig()
  if (!cfg || !cfg.apiKey) throw new Error('AI Coach not configured. Add an API key in Settings.')

  const provider = getProviderConfig()
  if (!provider) throw new Error('Unknown provider')

  const model = cfg.model || DEFAULT_MODELS[cfg.provider] || 'gpt-4o-mini'
  const isClaude = cfg.provider === 'claude'
  const url = isClaude ? `${provider.baseUrl}/messages` : `${provider.baseUrl}/chat/completions`
  const body = provider.formatBody(messages, model)

  const resp = await fetch(url, {
    method: 'POST',
    headers: provider.headers,
    body: JSON.stringify(body)
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`LLM request failed (${resp.status}): ${text}`)
  }

  const json = await resp.json()
  const content = provider.parseResponse(json)
  if (!content) throw new Error('LLM returned empty response')
  return content
}

function buildSingleMatchPrompt(ctx: SingleMatchContext): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `You are a Dota 2 coach. Analyze the match and provide 3-5 coaching points.
Each point MUST be valid JSON with these fields:
- title: string (short, e.g. "Farming Efficiency")
- desc: string (1-2 sentences with specific actionable advice)
- status: "ontime" | "late" (ontime = good, late = needs improvement)

Return ONLY a JSON array, no markdown, no code fences.

Example:
[{"title":"Farming Efficiency","desc":"At 480 GPM you're 15% below average for Anti-Mage. Focus on last-hitting under tower and stacking ancients.","status":"late"}]`
    },
    {
      role: 'user',
      content: JSON.stringify(ctx, null, 2)
    }
  ]
}

export interface SingleMatchContext {
  heroName: string
  position: string
  kills: number
  deaths: number
  assists: number
  gpm: number
  networth: number
  isVictory: boolean
  items: { name: string; time: number; cost: number }[]
  totalDamage: number
  wardsPlaced: number
}

export interface CoachingPoint {
  title: string
  desc: string
  status: 'ontime' | 'late'
}

export async function generateMatchCoaching(ctx: SingleMatchContext): Promise<CoachingPoint[]> {
  const text = await llmChat(buildSingleMatchPrompt(ctx))
  const cleaned = extractJson(text)
  const parsed = JSON.parse(cleaned)
  if (!Array.isArray(parsed)) throw new Error('Expected array')
  return parsed.slice(0, 5)
}

function buildSessionPrompt(matches: SessionMatchSummary[]): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `You are a Dota 2 coach analyzing a player's last ${matches.length} matches.
Return a JSON object with:
- summary: string (1 sentence overall assessment)
- patterns: string[] (3-4 specific patterns found across matches)
- recommendations: string[] (2-3 actionable recommendations)

Return ONLY valid JSON, no markdown, no code fences.`
    },
    {
      role: 'user',
      content: JSON.stringify({ matches }, null, 2)
    }
  ]
}

export interface SessionMatchSummary {
  heroName: string
  position: string
  kills: number
  deaths: number
  assists: number
  gpm: number
  outcome: 'win' | 'loss'
}

export interface SessionReview {
  summary: string
  patterns: string[]
  recommendations: string[]
}

export async function generateSessionReview(matches: SessionMatchSummary[]): Promise<SessionReview> {
  const text = await llmChat(buildSessionPrompt(matches))
  const cleaned = extractJson(text)
  const parsed = JSON.parse(cleaned)
  if (!parsed.summary || !parsed.patterns || !parsed.recommendations) throw new Error('Invalid response shape')
  return parsed as SessionReview
}

export function isLlmConfigured(): boolean {
  return loadLlmConfig() !== null
}

export interface DraftSuggestionResult {
  suggestions: {
    carry: { heroName: string; reason: string; confidence: number }
    mid: { heroName: string; reason: string; confidence: number }
    offlane: { heroName: string; reason: string; confidence: number }
    softSupport: { heroName: string; reason: string; confidence: number }
    hardSupport: { heroName: string; reason: string; confidence: number }
  }
}

function buildDraftSuggestionPrompt(
  radiantHeroes: string[],
  direHeroes: string[],
  playerTeam: string
): ChatMessage[] {
  const myTeam = playerTeam === 'Radiant' ? 'Radiant' : 'Dire'
  const enemyTeam = myTeam === 'Radiant' ? 'Dire' : 'Radiant'
  const myHeroes = myTeam === 'Radiant' ? radiantHeroes : direHeroes
  const enemyHeroes = myTeam === 'Radiant' ? direHeroes : radiantHeroes
  const allPicked = [...myHeroes, ...enemyHeroes]

  const VALID_HEROES = [
    'Abaddon','Alchemist','Ancient Apparition','Anti-Mage','Arc Warden','Axe',
    'Bane','Batrider','Beastmaster','Bloodseeker','Bounty Hunter','Brewmaster',
    'Bristleback','Broodmother','Centaur Warrunner','Chaos Knight','Chen','Clinkz',
    'Clockwerk','Crystal Maiden','Dark Seer','Dark Willow','Dawnbreaker','Dazzle',
    'Death Prophet','Disruptor','Doom','Dragon Knight','Drow Ranger','Earth Spirit',
    'Earthshaker','Elder Titan','Ember Spirit','Enchantress','Enigma','Faceless Void',
    'Grimstroke','Gyrocopter','Hoodwink','Huskar','Invoker','Io','Jakiro',
    'Juggernaut','Keeper of the Light','Kez','Kunkka','Largo','Legion Commander',
    'Leshrac','Lich','Lifestealer','Lina','Lion','Lone Druid','Luna','Lycan',
    'Magnus','Marci','Mars','Medusa','Meepo','Mirana','Monkey King','Morphling',
    'Muerta','Naga Siren',"Nature's Prophet",'Necrophos','Night Stalker','Nyx Assassin',
    'Ogre Magi','Omniknight','Oracle','Outworld Devourer','Pangolier','Phantom Assassin',
    'Phantom Lancer','Phoenix','Primal Beast','Puck','Pudge','Pugna','Queen of Pain',
    'Razor','Riki','Ring Master','Rubick','Sand King','Shadow Demon','Shadow Fiend',
    'Shadow Shaman','Silencer','Skywrath Mage','Slardar','Slark','Snapfire','Sniper',
    'Spectre','Spirit Breaker','Storm Spirit','Sven','Techies','Templar Assassin',
    'Terrorblade','Tidehunter','Timbersaw','Tinker','Tiny','Treant Protector',
    'Troll Warlord','Tusk','Underlord','Undying','Ursa','Vengeful Spirit',
    'Venomancer','Viper','Visage','Void Spirit','Warlock','Weaver','Windranger',
    'Winter Wyvern','Witch Doctor','Wraith King','Zeus'
  ]

  return [
    {
      role: 'system',
      content: `You are a Dota 2 draft advisor. You MUST respond with ONLY valid JSON, nothing else.

MY TEAM (${myTeam}) picks so far: ${myHeroes.length > 0 ? myHeroes.join(', ') : 'none'}
ENEMY TEAM (${enemyTeam}) picks so far: ${enemyHeroes.length > 0 ? enemyHeroes.join(', ') : 'none'}
ALREADY PICKED (cannot reuse): ${allPicked.length > 0 ? allPicked.join(', ') : 'none'}

YOUR TASK: Suggest exactly ONE hero for each of these 5 positions that ${myTeam} should pick:
1. carry
2. mid
3. offlane
4. softSupport
5. hardSupport

CRITICAL RULES:
- You may ONLY use hero names from this EXACT list. Do NOT invent, modify, or abbreviate any name:
${VALID_HEROES.join(', ')}
- Do NOT use any name not in the list above. No "Lone Druid" vs "LoneDruid" variations — use the exact spelling from the list.
- Do NOT suggest a hero that is already picked by either team.
- Each of the 5 positions must have a DIFFERENT hero.
- If a position is already clearly filled by an existing pick on ${myTeam}, still suggest a hero for it but note it may be contested.

OUTPUT FORMAT (strict JSON, no markdown, no code fences, no extra text):
{"suggestions":{"carry":{"heroName":"Hero Name","reason":"1 sentence explanation","confidence":85},"mid":{"heroName":"Hero Name","reason":"1 sentence explanation","confidence":80},"offlane":{"heroName":"Hero Name","reason":"1 sentence explanation","confidence":75},"softSupport":{"heroName":"Hero Name","reason":"1 sentence explanation","confidence":70},"hardSupport":{"heroName":"Hero Name","reason":"1 sentence explanation","confidence":65}}}

Valid hero names to choose from: ${VALID_HEROES.join(', ')}

Double-check every heroName you output is in the list above before responding.`
    },
    {
      role: 'user',
      content: `Suggest 5 heroes (carry, mid, offlane, softSupport, hardSupport) for ${myTeam} to pick against ${enemyTeam}. Only use hero names from the approved list.`
    }
  ]
}

export async function generateDraftSuggestion(
  radiantHeroes: string[],
  direHeroes: string[],
  playerTeam: string
): Promise<DraftSuggestionResult> {
  const VALID_HEROES = new Set([
    'Abaddon','Alchemist','Ancient Apparition','Anti-Mage','Arc Warden','Axe',
    'Bane','Batrider','Beastmaster','Bloodseeker','Bounty Hunter','Brewmaster',
    'Bristleback','Broodmother','Centaur Warrunner','Chaos Knight','Chen','Clinkz',
    'Clockwerk','Crystal Maiden','Dark Seer','Dark Willow','Dawnbreaker','Dazzle',
    'Death Prophet','Disruptor','Doom','Dragon Knight','Drow Ranger','Earth Spirit',
    'Earthshaker','Elder Titan','Ember Spirit','Enchantress','Enigma','Faceless Void',
    'Grimstroke','Gyrocopter','Hoodwink','Huskar','Invoker','Io','Jakiro',
    'Juggernaut','Keeper of the Light','Kez','Kunkka','Largo','Legion Commander',
    'Leshrac','Lich','Lifestealer','Lina','Lion','Lone Druid','Luna','Lycan',
    'Magnus','Marci','Mars','Medusa','Meepo','Mirana','Monkey King','Morphling',
    'Muerta','Naga Siren',"Nature's Prophet",'Necrophos','Night Stalker','Nyx Assassin',
    'Ogre Magi','Omniknight','Oracle','Outworld Devourer','Pangolier','Phantom Assassin',
    'Phantom Lancer','Phoenix','Primal Beast','Puck','Pudge','Pugna','Queen of Pain',
    'Razor','Riki','Ring Master','Rubick','Sand King','Shadow Demon','Shadow Fiend',
    'Shadow Shaman','Silencer','Skywrath Mage','Slardar','Slark','Snapfire','Sniper',
    'Spectre','Spirit Breaker','Storm Spirit','Sven','Techies','Templar Assassin',
    'Terrorblade','Tidehunter','Timbersaw','Tinker','Tiny','Treant Protector',
    'Troll Warlord','Tusk','Underlord','Undying','Ursa','Vengeful Spirit',
    'Venomancer','Viper','Visage','Void Spirit','Warlock','Weaver','Windranger',
    'Winter Wyvern','Witch Doctor','Wraith King','Zeus'
  ])

  const text = await llmChat(buildDraftSuggestionPrompt(radiantHeroes, direHeroes, playerTeam))
  const cleaned = extractJson(text)
  const parsed = JSON.parse(cleaned)
  if (!parsed.suggestions) throw new Error('Invalid draft suggestion response')

  const positions = ['carry', 'mid', 'offlane', 'softSupport', 'hardSupport'] as const
  for (const pos of positions) {
    const hero = parsed.suggestions[pos]
    if (hero && !VALID_HEROES.has(hero.heroName)) {
      hero.heroName = hero.heroName.replace(/[^a-zA-Z\s'-]/g, '').trim()
      if (!VALID_HEROES.has(hero.heroName)) {
        hero.heroName = ''
        hero.confidence = 0
      }
    }
  }

  return parsed as DraftSuggestionResult
}
