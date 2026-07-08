import { json } from 'stream/consumers'
import { fetchFromStratz } from '../client'
import { MATCH_DETAILS_QUERY } from '../graphql/queries/matchDetails'

export async function getMatchDetails(matchId: number | string) {
  const data = await fetchFromStratz(MATCH_DETAILS_QUERY, {
    matchId
  })
//   console.log(JSON.stringify(data))
  return data
}
