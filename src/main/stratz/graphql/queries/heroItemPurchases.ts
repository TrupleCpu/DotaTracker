export const HERO_ITEM_PURCHASES_QUERY = `
query HeroItemPurchases($heroId: Short!, $bracketBasicIds: [RankBracketBasicEnum], $positionIds: [MatchPlayerPositionType]) {
  heroStats {
    itemFullPurchase(heroId: $heroId, bracketBasicIds: $bracketBasicIds, positionIds: $positionIds) {
      heroId
      itemId
      time
      matchCount
      winCount
      winsAverage
    }
  }
}
`
