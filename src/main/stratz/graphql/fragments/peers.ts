export const PEERS_FRAGMENT = `
stratz {
  page {
    player(steamAccountId: $steamId) {
      peers(request: $peersRequest, take: $take) { 
        matchCount
        winCount
        lastMatchDateTime
        steamAccount {
          id
          name
          avatar
        }
      }
    }
  }
}
`