export type ODPSettings = {
  odpKey: string | null
  orgId: string | null
}

export type ODPValues = {
  keywords: {
    id: string
    name: string
  }[]
  categories: {
    id: string
    name: string
  }[]
  regions: {
    id: string
    name: string
  }[]
  licences: {
    id: string
    name: string
  }[]
}
