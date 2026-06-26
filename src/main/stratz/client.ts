const STRATZ_API_TOKEN = import.meta.env.STRATZ_API_TOKEN
const STRATZ_GRAPHQL_URL = 'https://api.stratz.com/graphql'

export async function fetchFromStratz(query: string, variables?: Record<string, any>) {
  if (!STRATZ_API_TOKEN) {
    throw new Error('STRATZ_API_TOKEN is not defined')
  }

  const res = await fetch(STRATZ_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRATZ_API_TOKEN}`,
      'User-Agent': 'STRATZ_API'
    },
    body: JSON.stringify({ query, variables })
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('Stratz error body:', body)
    throw new Error(`Stratz API responded with status code: ${res.status}`)
  }

  const json = await res.json()

  if (json.errors && json.errors.length > 0) {
    console.error(json.errors)
    throw new Error(json.errors[0].message)
  }

  return json.data
}
