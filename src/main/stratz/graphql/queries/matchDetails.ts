export const MATCH_DETAILS_QUERY = `
query MatchDetails($matchId: Long!) {
  match(id: $matchId) {
    gameMode
    radiantNetworthLeads
    radiantExperienceLeads
    players {
      steamAccountId
      heroId
      isVictory
      imp
      kills
      deaths
      assists
      experiencePerMinute
      level
      position
      lane
      item0Id
      item1Id
      item3Id
      item4Id
      item5Id
      backpack0Id
      backpack1Id
      backpack2Id
      neutral0Id
      goldPerMinute
      networth
      abilities {
        abilityId
        time
        level
        abilityType{
					id
          name
            }
          }
      stats {
        deniesPerMinute
        impPerMinute
        itemPurchases {
          itemId
          time
        }
        farmDistributionReport {
          creepLocation {
            id
            count
            xp
          }
        }
        networthPerMinute
        killEvents {
          time
          gold
          xp
          positionX
          positionY
        }
        deathEvents {
          time
          goldLost
          xpFed
          positionX
          positionY
        }
        assistEvents {
          time
          gold
          xp
          positionX
          positionY
				}
        heroDamagePerMinute
        heroDamageReceivedPerMinute
        campStack
        wards {
          time
          type
          positionX
          positionY
        }
        healPerMinute
        towerDamagePerMinute
        runes {
          time
          rune
          action
          gold
          positionX
          positionY
        }
      }
    }
  }
}
`
