import axios from 'axios'
import React from 'react'
import ChatsTable from '../components/ChatsTable'

import DataTable from '../components/DataTable'
import { getNegativeFeedbackChats } from '../resources/api-constants'

const FeedbackPage = () => {
  const negativeFeedbackDatasource = () => {
    return axios
      .get(
        getNegativeFeedbackChats({
          startTime: new Date(new Date().setDate(new Date().getDate() - 30)).toDateString(),
          endTime: new Date().toDateString(),
          events: [],
        }),
        { withCredentials: true },
      )
      .then((r) => r.data.response)
  }

  return (
    <>
      <h1>Feedback</h1>
      <ChatsTable dataSource={negativeFeedbackDatasource}></ChatsTable>
    </>
  )
}

export default FeedbackPage
