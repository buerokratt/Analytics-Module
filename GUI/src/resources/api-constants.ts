const baseUrl = process.env.REACT_APP_API_URL
const chatsUrl = process.env.REACT_APP_BUEROKRATT_CHATBOT_URL

export const getLinkToChat = (chatId: string) => `${chatsUrl}/vestlus/ajalugu?chat=${chatId}`

export const getTesting = (): string => {
  return baseUrl + '/testing'
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
