import heroes from '../../../main/data/heroes.json'

interface Hero {
  id: number
  localized_name: string
  img: string
  icon: string
  primary_attr: string
  attack_type: string
}

const heroMap = new Map<number, Hero>((heroes as Hero[]).map((h) => [h.id, h]))
const heroNameMap = new Map<string, Hero>((heroes as Hero[]).map((h) => [h.localized_name.toLowerCase(), h]))

export function getHero(id: number): Hero | null {
  return heroMap.get(id) ?? null
}

export function getHeroByName(name: string): Hero | null {
  return heroNameMap.get(name.toLowerCase()) ?? null
}

export function getHeroImgUrl(imgPath: string): string {
  return `https://cdn.cloudflare.steamstatic.com${imgPath}`
}
