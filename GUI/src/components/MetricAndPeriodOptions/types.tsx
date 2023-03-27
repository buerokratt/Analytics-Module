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

export interface MetricOptionsState {
  period: string
  metric: string

  start: string
  end: string
  options: string[]
}

export type OnChangeCallback = MetricOptionsState & { groupByPeriod: string }
