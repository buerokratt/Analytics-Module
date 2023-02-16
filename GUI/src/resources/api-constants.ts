const baseUrl = process.env.REACT_APP_API_URL
const chatsUrl = process.env.REACT_APP_BUEROKRATT_CHATBOT_URL

export const openSearchDashboard = process.env.REACT_APP_OPENSEARCH_DASHBOARD_URL

export const getLinkToChat = (chatId: string) => `${chatsUrl}/vestlus/ajalugu?chat=${chatId}`

export const getOpenDataValues = (lang: string): string => baseUrl + '/odp/values?lang=' + lang

export const openDataSettings = (): string => baseUrl + '/odp/settings'
export const deleteOpenDataSettings = (): string => baseUrl + '/odp/delete-settings'

export const openDataDataset = (): string => baseUrl + '/odp/dataset'
export const getOpenDataDataset = (datasetId: string): string => baseUrl + '/odp/dataset?datasetId=' + datasetId

export const scheduledReports = (): string => baseUrl + '/odp/scheduled-reports'
export const editScheduledReport = (): string => baseUrl + '/odp/edit-scheduled-report'
export const deleteScheduledReport = (): string => baseUrl + '/odp/delete-scheduled-report'

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
