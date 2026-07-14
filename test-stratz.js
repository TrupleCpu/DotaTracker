const STRATZ_API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdWJqZWN0IjoiMDY5ODBmOWQtN2FhOC00OWVhLWEyZjEtNmZjOGE0NDVmNGIyIiwiU3RlYW1JZCI6Ijk5Njc4MzM4NiIsIkFQSVVzZXIiOiJ0cnVlIiwibmJmIjoxNzgyMjg5NjkxLCJleHAiOjE4MTM4MjU2OTEsImlhdCI6MTc4MjI4OTY5MSwiaXNzIjoiaHR0cHM6Ly9hcGkuc3RyYXR6LmNvbSJ9.2EyVW7ocenkaZVSIO4KkJah_sCg1ySSc8fwK5EeXSU0"
const STRATZ_GRAPHQL_URL = 'https://api.stratz.com/graphql'

const QUERY = `
  query GetDraftWinRates($heroIds: [Short!]) {
    heroStats {
      winMonth(heroIds: $heroIds) {
        heroId
        winCount
        matchCount
      }
    }
  }
`

async function run() {
  const res = await fetch(STRATZ_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRATZ_API_TOKEN}`,
      'User-Agent': 'STRATZ_API'
    },
    body: JSON.stringify({ 
      query: QUERY,
      variables: { heroIds: [1, 2] }
    })
  })

  const json = await res.json()
  console.log(JSON.stringify(json.data.heroStats.winMonth, null, 2))
}

run().catch(console.error)
