export interface Option {
  id: string
  labelKey: string
  additionalKey?: string
  subOptions?: SubOption[]
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
