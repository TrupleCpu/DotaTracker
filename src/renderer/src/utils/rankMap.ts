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
  let tier = ''
  if (r % 10 === 4) {
    tier = 'IV'
  } else if (r % 10 === 5) {
    tier = 'V'
  } else {
    tier = 'I'.repeat(r % 10)
  }

  return `${rank} ${tier}`
}
