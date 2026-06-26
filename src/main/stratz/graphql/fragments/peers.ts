export const PEERS_FRAGMENT = `
stratz {
  page {
    player(steamAccountId: $steamId) {
      peers(request: $peersRequest) { 
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