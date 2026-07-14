import { fetchFromStratz } from '../client'
import { GET_HERO_MATCHUPS, GET_LANE_OUTCOMES, GET_DRAFT_WIN_RATES } from '../graphql/queries/draftAnalysis'

export async function analyzeHeroMatchups(heroId: number) {
  try {
    const matchupData = await fetchFromStratz(GET_HERO_MATCHUPS, {
      heroId,
      matchLimit: 100,
      take: 10
    })

    const disadvantageBlock = matchupData?.heroStats?.heroVsHeroMatchup?.disadvantage || []
    let counters = []
    if (disadvantageBlock.length > 0 && disadvantageBlock[0].vs) {
      counters = disadvantageBlock[0].vs
    }

    // Sort by lowest winsAverage
    counters.sort((a: any, b: any) => a.winsAverage - b.winsAverage)

    const laneData = await fetchFromStratz(GET_LANE_OUTCOMES, { heroId, isWith: false })
    const laneOutcomes = laneData?.heroStats?.laneOutcome || []
    
    // Sort lane outcomes to find the hardest lane opponents (lowest win rate)
    const validLanes = laneOutcomes.filter((l: any) => l.matchCount > 200)
    validLanes.sort((a: any, b: any) => (a.winCount / a.matchCount) - (b.winCount / b.matchCount))

    return {
      targetHeroId: heroId,
      counters: counters.slice(0, 5),
      laneOutcomes: validLanes
    }
  } catch (err) {
    console.error('Failed to analyze hero matchups', err)
    throw err
  }
}

export async function calculateDraftWinProbability(radiantIds: number[], direIds: number[]) {
  try {
    const allIds = [...radiantIds, ...direIds]
    if (allIds.length === 0) return { radiantProb: 50, direProb: 50 }

    const data = await fetchFromStratz(GET_DRAFT_WIN_RATES, { heroIds: allIds })
    const stats = data?.heroStats?.winMonth || []

    const heroWinRates: Record<number, number> = {}
    const aggregated: Record<number, { w: number; m: number }> = {}
    
    stats.forEach((s: any) => {
      if (!aggregated[s.heroId]) aggregated[s.heroId] = { w: 0, m: 0 }
      aggregated[s.heroId].w += s.winCount
      aggregated[s.heroId].m += s.matchCount
    })

    Object.keys(aggregated).forEach((id) => {
      const agg = aggregated[Number(id)]
      heroWinRates[Number(id)] = agg.m > 0 ? agg.w / agg.m : 0.5
    })

    let rScore = 0; let dScore = 0;
    radiantIds.forEach(id => { rScore += heroWinRates[id] || 0.5 })
    direIds.forEach(id => { dScore += heroWinRates[id] || 0.5 })
    
    const rAvg = radiantIds.length > 0 ? rScore / radiantIds.length : 0.5
    const dAvg = direIds.length > 0 ? dScore / direIds.length : 0.5
    
    const totalAvg = rAvg + dAvg
    const radiantProb = (rAvg / totalAvg) * 100
    const direProb = (dAvg / totalAvg) * 100
    
    return { radiantProb, direProb }
  } catch(e) {
    console.error(e)
    return { radiantProb: 50, direProb: 50 }
  }
}
