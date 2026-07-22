import { loadLlmConfig } from './configService'
import { ALL_HERO_NAMES } from '../data/heroNames'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ProviderConfig {
  baseUrl: string
  headers: Record<string, string>
  formatBody: (messages: ChatMessage[], model: string) => unknown
  parseResponse: (json: Record<string, unknown>) => string
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
          max_tokens: 2048,
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
          return { model, messages: msgs, ...(system ? { system } : {}), max_tokens: 2048 }
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
          max_tokens: 2048,
          response_format: { type: 'json_object' }
        }),
        parseResponse: (json) => json.choices?.[0]?.message?.content ?? ''
      }
    }
    default:
      return null
  }
}

function stripCodeFences(text: string): string {
  return text.replace(/```(?:json)?\s*\n?/gi, '').trim()
}

function extractJsonArray(text: string): string | null {
  const start = text.indexOf('[')
  if (start === -1) return null
  let depth = 0
  for (let i = start; i < text.length; i++) {
    if (text[i] === '[') depth++
    else if (text[i] === ']') {
      depth--
      if (depth === 0) return text.substring(start, i + 1)
    }
  }
  return null
}

function extractJson(text: string): string {
  const cleaned = stripCodeFences(text)

  try { JSON.parse(cleaned); return cleaned } catch { /* fall through */ }

  let pos = 0
  while (true) {
    const start = cleaned.indexOf('{', pos)
    if (start === -1) break
    let depth = 0
    for (let i = start; i < cleaned.length; i++) {
      if (cleaned[i] === '{') depth++
      else if (cleaned[i] === '}') {
        depth--
        if (depth === 0) {
          const candidate = cleaned.substring(start, i + 1)
          try { JSON.parse(candidate); return candidate } catch { pos = start + 1; break }
        }
      }
    }
    if (depth !== 0) pos = start + 1
    if (pos >= cleaned.length) break
  }

  const asArray = extractJsonArray(cleaned)
  if (asArray) {
    try { JSON.parse(asArray); return asArray } catch { /* fall through */ }
  }

  return cleaned
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
Each point is JSON: {"title":"short name","desc":"1-2 sentences actionable advice","status":"ontime|late"}
Return ONLY a JSON array, no markdown, no code fences.
Example: [{"title":"Farming","desc":"At 480 GPM you're 15% below average for Anti-Mage. Focus on last-hitting.","status":"late"}]`
    },
    {
      role: 'user',
      content: JSON.stringify(ctx)
    }
  ]
}

export interface SingleMatchContext {
  h: string    // heroName
  p: string    // position
  k: number    // kills
  d: number    // deaths
  a: number    // assists
  g: number    // gpm
  nw: number   // networth
  w: boolean   // isVictory
  i: { n: number; t: number; c: number }[]  // items (id, time, cost)
  td: number   // totalDamage
  wp: number   // wardsPlaced
}

export interface CoachingPoint {
  title: string
  desc: string
  status: 'ontime' | 'late'
}

export async function generateMatchCoaching(ctx: SingleMatchContext): Promise<CoachingPoint[]> {
  const text = await llmChat(buildSingleMatchPrompt(ctx))
  const cleaned = extractJson(text)
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error('AI Coach returned invalid JSON. Try again or switch models.')
  }
  if (!Array.isArray(parsed)) {
    if (parsed && typeof parsed === 'object' && 'coachingPoints' in (parsed as Record<string, unknown>)) {
      const nested = (parsed as Record<string, unknown>).coachingPoints
      if (Array.isArray(nested)) return nested.slice(0, 5)
    }
    throw new Error('AI Coach response was not in the expected format. Try again.')
  }
  return parsed.slice(0, 5)
}

function buildSessionPrompt(matches: SessionMatchSummary[]): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `You are a Dota 2 coach analyzing a player's last ${matches.length} matches.

You MUST respond with ONLY a valid JSON object. No markdown, no code fences, no extra text.

The JSON must have exactly these three fields:
- "summary": string (1 sentence overall assessment)
- "patterns": array of strings (3-4 specific patterns found across matches)
- "recommendations": array of strings (2-3 actionable recommendations)

Example:
{"summary":"Strong performance on core heroes but struggles with positioning in late game.","patterns":["Pattern 1","Pattern 2","Pattern 3"],"recommendations":["Rec 1","Rec 2"]}`
    },
    {
      role: 'user',
      content: JSON.stringify({ matches })
    }
  ]
}

export interface SessionMatchSummary {
  h: string    // heroName
  p: string    // position
  k: number    // kills
  d: number    // deaths
  a: number    // assists
  g: number    // gpm
  o: string    // outcome ('win'|'loss')
}

export interface SessionReview {
  summary: string
  patterns: string[]
  recommendations: string[]
}

export async function generateSessionReview(matches: SessionMatchSummary[]): Promise<SessionReview> {
  const text = await llmChat(buildSessionPrompt(matches))
  const cleaned = extractJson(text)
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error(`AI Coach returned invalid JSON. Try again or switch models. Raw: ${text.substring(0, 300)}`)
  }

  const result = findSessionReview(parsed)
  if (result) return result

  throw new Error(`AI Coach response was not in the expected format. Raw: ${text.substring(0, 300)}`)
}

function findSessionReview(value: unknown): SessionReview | null {
  if (!value || typeof value !== 'object') return null

  if (Array.isArray(value)) {
    for (const item of value) {
      const result = findSessionReview(item)
      if (result) return result
    }
    return null
  }

  const obj = value as Record<string, unknown>

  if (typeof obj.summary === 'string' || typeof obj.patterns !== 'undefined' || typeof obj.recommendations !== 'undefined') {
    return normalizeSessionReview(obj)
  }

  for (const val of Object.values(obj)) {
    if (val && typeof val === 'object') {
      const result = findSessionReview(val)
      if (result) return result
    }
  }

  return null
}

function normalizeSessionReview(raw: Record<string, unknown>): SessionReview {
  return {
    summary: typeof raw.summary === 'string' ? raw.summary : String(raw.summary ?? ''),
    patterns: coerceToStringArray(raw.patterns ?? raw.pattern ?? []),
    recommendations: coerceToStringArray(raw.recommendations ?? raw.recommendation ?? raw.tips ?? []),
  }
}

function coerceToStringArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((v): v is string => typeof v === 'string')
  if (typeof val === 'string') return [val]
  return []
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

  const VALID_HEROES = ALL_HERO_NAMES as readonly string[]

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
  const VALID_HEROES = new Set(ALL_HERO_NAMES)

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
