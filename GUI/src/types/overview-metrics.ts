export interface OverviewMetricPreference {
  metric: string
  active: boolean
  ordinality: number
}

export interface OverviewMetricData {
  metric: string
  data: {
    left: number
    right: number
  }
}
