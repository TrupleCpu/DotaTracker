const ranks: Record<number, string> = {
  1: 'Herald',
  2: 'Guardian',
  3: 'Crusader',
  4: 'Archon',
  5: 'Legend',
  6: 'Ancient',
  7: 'Divine',
  8: 'Immortal'
}

export const rankToString = (r: number): string => {
  const rank = ranks[Math.floor(r / 10)]
  const tier = 'I'.repeat(r % 10)

  return `${rank} ${tier}`
}
