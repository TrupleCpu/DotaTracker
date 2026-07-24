export const REQUEST_PARSE_MUTATION = `
mutation RequestParse($matchId: Long!) {
  reparseMatch(matchId: $matchId)
}
`
