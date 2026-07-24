import { getStratzToken } from '../tokenStore'

const STRATZ_GRAPHQL_URL = 'https://api.stratz.com/graphql'
const TIMEOUT_MS = 30000
const MAX_RETRIES = 3
type GraphQLVariables = Record<string, unknown>

const inflightMap = new Map<string, Promise<unknown>>()

function cacheKey(query: string, variables?: GraphQLVariables): string {
  return query + JSON.stringify(variables ?? {})
}

export async function fetchFromStratz(
  query: string,
  variables?: GraphQLVariables
): Promise<unknown> {
  const key = cacheKey(query, variables)

  const existing = inflightMap.get(key)
  if (existing) return existing

  const promise = executeQueryWithRetry(query, variables)
  inflightMap.set(key, promise)

  try {
    return await promise
  } finally {
    inflightMap.delete(key)
  }
}

async function executeQueryWithRetry(
  query: string,
  variables?: GraphQLVariables,
  attempt = 0
): Promise<unknown> {
  try {
    return await executeQuery(query, variables)
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    const isRateLimit = msg.includes('429') || msg.includes('rate limit')
    if (isRateLimit && attempt < MAX_RETRIES) {
      const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000)
      await new Promise((r) => setTimeout(r, delay))
      return executeQueryWithRetry(query, variables, attempt + 1)
    }
    throw err
  }
}

async function executeQuery(query: string, variables?: GraphQLVariables): Promise<unknown> {
  const token = getStratzToken()
  if (!token) {
    throw new Error('STRATZ_API_TOKEN is not defined')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(STRATZ_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'STRATZ_API'
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal
    })

    if (!res.ok) {
      throw new Error(`Stratz API responded with status code: ${res.status}`)
    }

    const json = await res.json()

    if (json.errors && json.errors.length > 0) {
      throw new Error(json.errors[0].message)
    }

    return json.data
  } finally {
    clearTimeout(timer)
  }
}
