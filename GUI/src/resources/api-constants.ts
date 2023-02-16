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

export const getBykIntents = (): string => {
  return baseUrl + '/byk-intents'
}

export const getBykPercentOfCorrecltyUnderstood = (): string => {
  return baseUrl + '/byk-pct-correctly-understood'
}

export const getCsv = (): string => {
  return baseUrl + '/csv'
}


// Feedback

export const getChatsStatuses = (): string => {
  return baseUrl + '/chat/status'
}

export const getAverageFeedbackOnBuerokrattChats = (): string => {
  return baseUrl + '/feedback/avg-feedback-to-buerokratt-chats'
}

export const getNpsOnCSAChatsFeedback = (): string => {
  return baseUrl + '/feedback/csa-chats-feedback-nps'
}

export const getNpsOnSelectedCSAChatsFeedback = (): string => {
  return baseUrl + '/feedback/selected-csa-feedback-nps'
}

export const getNegativeFeedbackChats = (): string => {
  return baseUrl + '/feedback/chats-with-negative-feedback'
}
