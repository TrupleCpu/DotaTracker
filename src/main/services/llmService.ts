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
        formatBody: (messages, model) => ({ model, messages, max_tokens: 1024 }),
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
        formatBody: (messages, model) => ({ model, messages, max_tokens: 1024 }),
        parseResponse: (json) => json.choices?.[0]?.message?.content ?? ''
      }
    }
    default:
      return null
  }
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

Return ONLY a JSON array, no markdown, no code fences. Example:
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
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim()
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
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim()
  const parsed = JSON.parse(cleaned)
  if (!parsed.summary || !parsed.patterns || !parsed.recommendations) throw new Error('Invalid response shape')
  return parsed as SessionReview
}

export function isLlmConfigured(): boolean {
  return loadLlmConfig() !== null
}
