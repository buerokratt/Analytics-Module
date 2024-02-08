const baseUrl = import.meta.env.REACT_APP_RUUTER_V2_ANALYTICS_API_URL
const chatsUrl = import.meta.env.REACT_APP_BUEROKRATT_CHATBOT_URL
const ruuterUrl = "http://ruuter:8080";

export const openSearchDashboard = "https://opensearch.org/"

export const getLinkToChat = (chatId: string) => `${chatsUrl}/chat/history?chat=${chatId}`

export const getOpenDataValues = (lang: string): string => baseUrl + '/odp/values?lang=' + lang

export const openDataSettings = (): string => baseUrl + '/odp/settings'
export const deleteOpenDataSettings = (): string => baseUrl + '/odp/delete-settings'

export const openDataDataset = (): string => baseUrl + '/odp/dataset'
export const getOpenDataDataset = (datasetId: string): string => baseUrl + '/odp/dataset?datasetId=' + datasetId

export const scheduledReports = (): string => baseUrl + '/odp/scheduled-reports'
export const editScheduledReport = (): string => baseUrl + '/odp/update-scheduled-report'
export const deleteScheduledReport = (): string => baseUrl + '/odp/delete-scheduled-report'
export const uploadScheduledReport = (datasetId: string, dateTime: string): string => ruuterUrl + '/odp/upload-scheduled-report?datasetId=' + datasetId + '&dateTime=' + dateTime
export const deleteCronJobTask = (): string => baseUrl + '/odp/delete-cron-job-task'

export const downloadOpenDataCSV = (): string => baseUrl + '/odp/download'

export const saveJsonToYaml = (): string => baseUrl + '/saveJsonToYml'

export const getTesting = (): string => {
  return baseUrl + '/testing'
}

export const overviewMetricPreferences = (): string => {
  return baseUrl + '/overview/preferences'
}

export const overviewMetrics = (metrics: string): string => {
  return baseUrl + `/overview/metrics?metrics=${metrics}`
}

export const geBykAvgResponseTime = (): string => {
  return baseUrl + '/buerokratt/byk-avg-response-speed'
}

export const getBykAvgSessionTime = (): string => {
  return baseUrl + '/buerokratt/byk-avg-sessions-time'
}

export const getBykIntents = (): string => {
  return baseUrl + '/buerokratt/byk-intents'
}

export const getBykPercentOfCorrecltyUnderstood = (): string => {
  return baseUrl + '/buerokratt/byk-pct-correctly-understood'
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

// Advisors

export const getChatForwards = (): string => {
  return baseUrl + '/csa/chat_forwards'
}

export const getAvgPickTime = (): string => {
  return baseUrl + '/csa/avg-time-picking-up-chat'
}

export const getAvgCsaPresent = (): string => {
  return baseUrl + '/csa/avg-present-number'
}

export const getCsaChatsTotal = (): string => {
  return baseUrl + '/csa/total-chats'
}

export const getCsaAvgChatTime = (): string => {
  return baseUrl + '/csa/avg-chat-time'
}


// Chats

export const getTotalChats = (): string => {
  return baseUrl + '/chats/chat-total-count'
}

export const getCipChats = (): string => {
  return baseUrl + '/chats/contact-information-fulfilled'
}

export const getAvgChatWaitingTime = (): string => {
  return baseUrl + '/chats/avg-median-waiting-time'
}

export const getAvgMessagesInChats = (): string => {
  return baseUrl + '/chats/chat-avg-num-of-messages'
}

export const getDurationChats = (): string => {
  return baseUrl + '/chats/chat-avg-duration'
}

export const getIdleChats = (): string => {
  return baseUrl + '/chats/chat-idle-count'
}
