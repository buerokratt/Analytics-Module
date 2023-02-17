export type ODPSettings = {
  odpKey: string | null
  orgId: string | null
}

export type ODPValuesType = {
  id: string
  name: string
}

export type ODPValues = {
  keywords: ODPValuesType[]
  categories: ODPValuesType[]
  regions: ODPValuesType[]
  licences: ODPValuesType[]
}
