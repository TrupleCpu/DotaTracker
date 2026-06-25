const STRATZ_API_TOKEN = import.meta.env.STRATZ_API_TOKEN
const STRATZ_GRAPHQL_URL = 'https://api.stratz.com/graphql'

async function fetchFromStratz(query: string) {
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
    console.error(json.errors)
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

      recentMatches: matches(request: { take: 7 }) {
        id
        durationSeconds
        gameMode
        endDateTime
        rank
        statsDateTime
        targetPlayer: players(steamAccountId: ${steamId}) {
          isVictory
          heroId
          imp
          kills
          deaths
          assists
          lane
          position
          award
          partyId
        }

        allPlayers: players {
          steamAccountId
          partyId

          steamAccount {
            name
            avatar
          }
        }
      }

      allMatches: matches(request: { take: 100 }) {
        id

        players {
          steamAccountId
          isVictory
          partyId

          steamAccount {
            name
            avatar
          }
        }
      }
    }
  }`

  const data = await fetchFromStratz(query)
  return data
}
