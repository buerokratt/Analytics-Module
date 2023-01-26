export interface OverviewMetricPreference {
  metric: string
  active: boolean
  ordinality: number
}

export interface OverviewMetricData {
  metric: string
  data: {
    left: {
      value: number
      title: string
    }
    right: {
      value: number
      title: string
    }
  }
}
