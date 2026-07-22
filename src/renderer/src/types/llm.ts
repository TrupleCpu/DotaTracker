export interface CoachingPoint {
  title: string
  desc: string
  status: 'ontime' | 'late'
}

export interface SessionReview {
  summary: string
  patterns: string[]
  recommendations: string[]
}
