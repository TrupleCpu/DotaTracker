import { fetchFromStratz } from '../stratz/client'
import { REQUEST_PARSE_MUTATION } from '../stratz/graphql/mutations/requestParse'

export async function requestParseMatch(matchId: number): Promise<boolean> {
  const data = (await fetchFromStratz(REQUEST_PARSE_MUTATION, { matchId })) as {
    reparseMatch?: boolean | null
  }
  return data?.reparseMatch ?? false
}
