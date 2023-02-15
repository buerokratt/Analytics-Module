const baseUrl = process.env.REACT_APP_API_URL
const chatsUrl = process.env.REACT_APP_BUEROKRATT_CHATBOT_URL

export const openSearchDashboard = process.env.REACT_APP_OPENSEARCH_DASHBOARD_URL

export const getLinkToChat = (chatId: string) => `${chatsUrl}/vestlus/ajalugu?chat=${chatId}`
export const getOpenDataValues = (lang: string): string => baseUrl + '/odp/values?lang=' + lang
export const openDataSettings = (): string => baseUrl + '/odp/settings'
export const deleteOpenDataSettings = (): string => baseUrl + '/odp/delete-settings'
export const openDataDataset = (): string => baseUrl + '/odp/dataset'
export const getOpenDataDataset = (id: string): string => baseUrl + '/odp/get-dataset'
export const downloadOpenDataCSV = (): string => baseUrl + '/odp/download'

export const getTesting = (): string => {
  return baseUrl + '/testing'
}

export const overviewMetricPreferences = (): string => {
  return baseUrl + '/overview/preferences'
}

export const overviewMetrics = (metric: string): string => {
  return baseUrl + `/overview/metrics?metric=${metric}`
}

export const getNegativeFeedbackChats = ({
  startTime,
  endTime,
  events,
}: {
  startTime: string
  endTime: string
  events: string[]
}): string => `${baseUrl}/negative-feedback?start=${startTime}&end=${endTime}&events=${events}`
