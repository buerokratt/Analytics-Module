import { DownloadReportsMetricsProps } from '../types/reports-metrics'

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

export const reportMetricsDownload = (): string => {
  return baseUrl + '/reports/metrics/download'
}

export const reportMetricsUpload = (): string => {
  return baseUrl + '/reports/metrics/upload'
}

export const reportMetricsDatasets = (): string => {
  return baseUrl + '/reports/metrics/dataset'
}

export const reportMetricsDeleteDataset = (): string => {
  return baseUrl + '/reports/metrics/delete-dataset'
}

export const reportODPKey = (): string => {
  return baseUrl + '/reports/odpkey';
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
