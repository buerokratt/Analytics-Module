export interface Option {
  id: string
  labelKey: string
  additionalKey?: string
  subOptions?: SubOption[]
  unit?: string
}

export interface SubOption {
  id: string
  labelKey: string
  isSelected?: boolean
  color?: string
}

export type PeriodType = 'today' | 'yesterday' | 'last30days' | 'month' | 'today' | ''

export type GroupByPeriod = 'hour' | 'day' | ''

export interface MetricOptionsState {
  period: PeriodType
  metric: string

  start: string
  end: string
  options: string[]
  groupByPeriod: GroupByPeriod
}

export type OnChangeCallback = MetricOptionsState
