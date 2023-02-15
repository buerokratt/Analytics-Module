const baseUrl = process.env.REACT_APP_API_URL
const chatsUrl = process.env.REACT_APP_BUEROKRATT_CHATBOT_URL

export const openSearchDashboard = process.env.REACT_APP_OPENSEARCH_DASHBOARD_URL

export const getLinkToChat = (chatId: string) => `${chatsUrl}/vestlus/ajalugu?chat=${chatId}`

export const getTesting = (): string => {
  return baseUrl + '/testing'
}

export const overviewMetricPreferences = (): string => {
  return baseUrl + '/overview/preferences'
}

export const overviewMetrics = (metric: string): string => {
  return baseUrl + `/overview/metrics?metric=${metric}`
}

export const geBykAvgResponseTime = (): string => {
  return baseUrl + '/byk-avg-response-speed'
}

export const getBykAvgSessionTime = (): string => {
  return baseUrl + '/byk-avg-sessions-time'
}

export const getBykIntentsCount = (): string => {
  return baseUrl + '/byk-intents-count'
}

export const getBykModifiedIntentsCount = (): string => {
  return baseUrl + '/byk-modified-intents'
}

export const getBykNewIntentsCount = (): string => {
  return baseUrl + '/byk-new-intents'
}

export const getBykPercentOfCorrecltyUnderstood = (): string => {
  return baseUrl + '/byk-pct-correctly-understood'
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
