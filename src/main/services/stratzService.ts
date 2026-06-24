const STRATZ_API_TOKEN = ''
const STRATZ_GRAPHQL_URL = 'https://api.stratz.com/graphql'

async function fetchFromStratz(query: string) {
  console.log('STRATZ token present:', !!STRATZ_API_TOKEN)
  console.log('STRATZ token value:', STRATZ_API_TOKEN) // remove after debugging

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
    body: JSON.stringify({ query })
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('Stratz error body:', body)
    throw new Error(`Stratz API responded with status code: ${res.status}`)
  }

  const json = await res.json()
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message)
  }

  return json.data
}

export async function getPlayerData(steamId: string | number) {
  if (!steamId) {
    console.error('Aborting Stratz fetch: steamId32 is missing or undefined')
    return []
  }
  const query = `{
  player(steamAccountId: ${steamId}) {
     matchCount
    winCount
    steamAccount {
     seasonRank
    }
    performance {
      killsAverage
      deathsAverage
      assistsAverage
      gpmAverage
      xpmAverage
      kills
      deaths
      maxStreak
    }
    matches(request: { take: 7 }) {
      id
      durationSeconds
      gameMode
      endDateTime
      rank  
      durationSeconds
      statsDateTime
      players(steamAccountId: ${steamId}) {
        lane
        isVictory
        heroId
        imp
        kills
        deaths
        assists
        position
        award
      }
    }
  }
}`
  const data = await fetchFromStratz(query)
  return data
}
