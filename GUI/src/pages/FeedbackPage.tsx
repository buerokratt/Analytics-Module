import { useTranslation } from 'react-i18next'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import OptionsPanel, { Option } from '../components/MetricAndPeriodOptions'
import MetricsCharts from '../components/MetricsCharts'
import ChatsTable from '../components/ChatsTable'
import {
  getAverageFeedbackOnBuerokrattChats,
  getChatsStatuses,
  getNegativeFeedbackChats,
  getNpsOnCSAChatsFeedback,
  getNpsOnSelectedCSAChatsFeedback,
} from '../resources/api-constants'
import { MetricOptionsState } from '../components/MetricAndPeriodOptions/types'
import { Chat } from '../types/chat'
import { formatDate } from '../util/charts-utils'

const FeedbackPage: React.FC = () => {
  const [chartData, setChartData] = useState({})
  const [chartKey, setChartKey] = useState('created')
  const [negativeFeedbackChats, setNegativeFeedbackChats] = useState<Chat[]>([])
  const [advisors, setAdvisors] = useState<any[]>([])
  const [currentMetric, setCurrentMetric] = useState('feedback.statuses')
  const randomColor = () => '#' + ((Math.random() * 0xffffff) << 0).toString(16)
  const [currentConfigs, setConfigs] = useState<
    MetricOptionsState & {
      groupByPeriod: string
    }
  >()

  const [feedbackMetrics, setFeedbackMetrics] = useState<Option[]>([
    {
      id: 'statuses',
      labelKey: 'feedback.statuses',
      subOptions: [
        { id: 'answered', labelKey: 'feedback.status_options.answered', color: randomColor() },
        { id: 'client-left', labelKey: 'feedback.status_options.client_left', color: randomColor() },
        { id: 'idle', labelKey: 'feedback.status_options.idle', color: randomColor() },
        { id: 'accepted', labelKey: 'feedback.status_options.accepted', color: randomColor() },
        { id: 'hate-speech', labelKey: 'feedback.status_options.hate_speech', color: randomColor() },
        { id: 'to-contact', labelKey: 'feedback.status_options.to_contact', color: randomColor() },
        { id: 'terminated', labelKey: 'feedback.status_options.terminated', color: randomColor() },
      ],
    },
    { id: 'burokratt_chats', labelKey: 'feedback.burokratt_chats' },
    { id: 'advisor_chats', labelKey: 'feedback.advisor_chats' },
    { id: 'selected_advisor_chats', labelKey: 'feedback.selected_advisor_chats' },
    { id: 'negative_feedback', labelKey: 'feedback.negative_feedback' },
  ])

  const { t } = useTranslation()

  const showNegativeChart = negativeFeedbackChats.length > 0 && currentConfigs?.metric === 'negative_feedback'

  useEffect(() => {
    switch (currentConfigs?.metric) {
      case 'statuses':
        fetchChatsStatuses()
        break
      case 'burokratt_chats':
        fetchAverageFeedbackOnBuerokrattChats()
        break
      case 'advisor_chats':
        fetchNpsOnCSAChatsFeedback()
        break
      case 'selected_advisor_chats':
        fetchNpsOnSelectedCSAChatsFeedback()
        break
      case 'negative_feedback':
        fetchChatsWithNegativeFeedback()
        break
    }
  }, [currentConfigs])

  const translateChartKeys = (obj: any, key: string) =>
    Object.keys(obj).reduce(
      (acc, k) =>
        k === key
          ? acc
          : {
              ...acc,
              ...{ [t(`chart.${k}`)]: obj[k] },
            },
      {},
    )

  const fetchChatsStatuses = async () => {
    const events = currentConfigs?.options.filter((e) => e === 'answered' || e === 'client-left' || e === 'idle') ?? []
    const csa_events =
      currentConfigs?.options.filter((e) => e !== 'answered' && e !== 'client-left' && e !== 'idle') ?? []
    const result = await axios.post(getChatsStatuses(), {
      metric: currentConfigs?.groupByPeriod ?? 'day',
      start_date: currentConfigs?.start,
      end_date: currentConfigs?.end,
      events: events?.length > 0 ? events : null,
      csa_events: csa_events?.length > 0 ? csa_events : null,
    })

    const response = result.data.response
      .flat(1)
      .map((entry: any) => ({
        ...translateChartKeys(entry, 'dateTime'),
        dateTime: new Date(entry.dateTime).getTime(),
      }))
      .reduce((a: any, b: any) => {
        const dateRow = a.find((i: any) => i['dateTime'] === b['dateTime'])
        if (dateRow) {
          dateRow[b['Event']] = b['Count']
        } else {
          a.push({
            dateTime: b['dateTime'],
            [b['Event']]: b['Count'],
          })
        }
        return a
      }, [])

    const chartData = {
      chartData: response,
      colors: feedbackMetrics[0].subOptions!.map(({ id, color }) => {
        return {
          id,
          color,
        }
      }),
    }

    setChartKey('dateTime')
    setChartData(chartData)
  }

  const fetchAverageFeedbackOnBuerokrattChats = async () => {
    const result = await axios.post(getAverageFeedbackOnBuerokrattChats(), {
      metric: currentConfigs?.groupByPeriod ?? 'day',
      start_date: currentConfigs?.start,
      end_date: currentConfigs?.end,
    })

    const response = result.data.response.map((entry: any) => ({
      ...translateChartKeys(entry, 'dateTime'),
      dateTime: new Date(entry.dateTime).getTime(),
    }))

    const chartData = {
      chartData: response,
      colors: [{ id: 'average', color: '#FFB511' }],
    }

    setChartKey('dateTime')
    setChartData(chartData)
  }

  const fetchNpsOnCSAChatsFeedback = async () => {
    const result = await axios.post(getNpsOnCSAChatsFeedback(), {
      metric: currentConfigs?.groupByPeriod ?? 'day',
      start_date: currentConfigs?.start,
      end_date: currentConfigs?.end,
    })

    const response = result.data.response.map((entry: any) => ({
      ...translateChartKeys(entry, 'dateTime'),
      dateTime: new Date(entry.dateTime).getTime(),
    }))

    const chartData = {
      chartData: response,
      colors: [{ id: 'Nps', color: '#FFB511' }],
    }

    setChartKey('dateTime')
    setChartData(chartData)
  }

  const fetchNpsOnSelectedCSAChatsFeedback = async () => {
    const excluded_csas = advisors.map((e) => e.id).filter((e) => !currentConfigs?.options.includes(e))
    const result = await axios.post(getNpsOnSelectedCSAChatsFeedback(), {
      metric: currentConfigs?.groupByPeriod ?? 'day',
      start_date: currentConfigs?.start,
      end_date: currentConfigs?.end,
      excluded_csas: excluded_csas.length ?? 0 > 0 ? excluded_csas : [''],
    })

    const res = result.data.response

    const advisorsList = Array.from(new Set(res.map((advisor: any) => advisor.customerSupportId)))
      .map((id: any) => res.find((e: any) => e.customerSupportId == id))
      .map((e) => {
        return {
          id: e?.customerSupportId ?? '',
          labelKey: e?.customerSupportDisplayName ?? '',
          color: randomColor(),
        }
      })

    if (advisorsList.length > advisors.length) {
      const updatedMetrics = [...feedbackMetrics]
      updatedMetrics[3].subOptions = advisorsList
      setFeedbackMetrics(updatedMetrics)
      setAdvisors(advisorsList)
    }

    const response = res
      .flat(1)
      .map((entry: any) => ({
        ...translateChartKeys(entry, 'dateTime'),
        dateTime: new Date(entry.dateTime).getTime(),
      }))
      .reduce((a: any, b: any) => {
        const dateRow = a.find((i: any) => i['dateTime'] === b['dateTime'])
        if (dateRow) {
          dateRow[b['Customer Support Display Name']] = b['Nps']
        } else {
          a.push({
            dateTime: b['dateTime'],
            [b['Customer Support Display Name']]: b['Nps'],
          })
        }
        return a
      }, [])

    const chartData = {
      chartData: response,
      colors: feedbackMetrics[3].subOptions!.map(({ id, color }) => {
        return {
          id,
          color,
        }
      }),
    }
    setChartKey('dateTime')
    setChartData(chartData)
  }

  const fetchChatsWithNegativeFeedback = async () => {
    const result = await axios.post(
      getNegativeFeedbackChats(),
      {
        events: '',
        start_date: currentConfigs?.start,
        end_date: currentConfigs?.end,
      },
      { withCredentials: true },
    )

    const response = result.data.response.map((entry: any) => ({
      ...translateChartKeys(entry, 'created'),
      dateTime: new Date(entry.created).getTime(),
    }))

    const chartData = {
      chartData: response,
      colors: [
        { id: 'dateTime', color: '#FFB511' },
        { id: 'Ended', color: '#FFB511' },
      ],
    }

    setChartKey('dateTime')
    setChartData(chartData)
    setNegativeFeedbackChats(result.data.response)
  }

  return (
    <>
      <h1>{t('menu.feedback')}</h1>
      <OptionsPanel
        metricOptions={feedbackMetrics}
        dateFormat="yyyy-MM-dd"
        onChange={(config) => {
          console.log(config)
          setConfigs(config)
          setCurrentMetric(`feedback.${config.metric}`)
        }}
      />
      <MetricsCharts
        title={currentMetric}
        data={chartData}
        dataKey={chartKey}
        startDate={currentConfigs?.start ?? formatDate(new Date(), 'yyyy-MM-dd')}
        endDate={currentConfigs?.end ?? formatDate(new Date(), 'yyyy-MM-dd')}
      />
      {showNegativeChart && <ChatsTable dataSource={negativeFeedbackChats} />}
    </>
  )
}

export default FeedbackPage
