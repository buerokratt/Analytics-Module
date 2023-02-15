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
import { formatDate, translateChartKeys } from '../util/charts-utils'
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators'
import { Subject } from 'rxjs'

const FeedbackPage: React.FC = () => {
  const [chartData, setChartData] = useState({})
  const [negativeFeedbackChats, setNegativeFeedbackChats] = useState<Chat[]>([])
  const [advisors, setAdvisors] = useState<any[]>([])
  const [currentMetric, setCurrentMetric] = useState('feedback.statuses')
  const randomColor = () => '#' + ((Math.random() * 0xffffff) << 0).toString(16)
  const [currentConfigs, setConfigs] = useState<
    MetricOptionsState & {
      groupByPeriod: string
    }
  >()
  const chartKey = 'dateTime'

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

  const [configsSubject] = useState(() => new Subject())
  useEffect(() => {
    const subscription = configsSubject
      .pipe(
        distinctUntilChanged(),
        debounceTime(300),
        switchMap((config: any) => {
          switch (config.metric) {
            case 'statuses':
              return fetchChatsStatuses(config)
            case 'burokratt_chats':
              return fetchAverageFeedbackOnBuerokrattChats(config)
            case 'advisor_chats':
              return fetchNpsOnCSAChatsFeedback(config)
            case 'selected_advisor_chats':
              return fetchNpsOnSelectedCSAChatsFeedback(config)
            case 'negative_feedback':
              return fetchChatsWithNegativeFeedback(config)
            default:
              return fetchChatsStatuses(config)
          }
        }),
      )
      .subscribe((chartData: any) => setChartData(chartData))

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchChatsStatuses = async (
    config: MetricOptionsState & {
      groupByPeriod: string
    },
  ) => {
    let chartData = {}
    const events = config?.options.filter((e) => e === 'answered' || e === 'client-left' || e === 'idle') ?? []
    const csa_events = config?.options.filter((e) => e !== 'answered' && e !== 'client-left' && e !== 'idle') ?? []
    try {
      const result = await axios.post(getChatsStatuses(), {
        metric: config?.groupByPeriod ?? 'day',
        start_date: config?.start,
        end_date: config?.end,
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

      chartData = {
        chartData: response,
        colors: feedbackMetrics[0].subOptions!.map(({ id, color }) => {
          return {
            id,
            color,
          }
        }),
      }
    } catch (_) {
      //error
    }
    return chartData
  }

  const fetchAverageFeedbackOnBuerokrattChats = async (config: any) => {
    let chartData = {}
    try {
      const result = await axios.post(getAverageFeedbackOnBuerokrattChats(), {
        metric: config?.groupByPeriod ?? 'day',
        start_date: config?.start,
        end_date: config?.end,
      })

      const response = result.data.response.map((entry: any) => ({
        ...translateChartKeys(entry, 'dateTime'),
        dateTime: new Date(entry.dateTime).getTime(),
      }))

      chartData = {
        chartData: response,
        colors: [{ id: 'average', color: '#FFB511' }],
      }
    } catch (_) {
      //error
    }
    return chartData
  }

  const fetchNpsOnCSAChatsFeedback = async (config: any) => {
    let chartData = {}
    try {
      const result = await axios.post(getNpsOnCSAChatsFeedback(), {
        metric: config?.groupByPeriod ?? 'day',
        start_date: config?.start,
        end_date: config?.end,
      })

      const response = result.data.response.map((entry: any) => ({
        ...translateChartKeys(entry, 'dateTime'),
        dateTime: new Date(entry.dateTime).getTime(),
      }))

      chartData = {
        chartData: response,
        colors: [{ id: 'Nps', color: '#FFB511' }],
      }
    } catch (_) {
      //error
    }
    return chartData
  }

  const fetchNpsOnSelectedCSAChatsFeedback = async (config: any) => {
    let chartData = {}
    try {
      const excluded_csas = advisors.map((e) => e.id).filter((e) => !config?.options.includes(e))
      const result = await axios.post(getNpsOnSelectedCSAChatsFeedback(), {
        metric: config?.groupByPeriod ?? 'day',
        start_date: config?.start,
        end_date: config?.end,
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

      chartData = {
        chartData: response,
        colors: feedbackMetrics[3].subOptions!.map(({ id, color }) => {
          return {
            id,
            color,
          }
        }),
      }
    } catch (_) {
      //error
    }
    return chartData
  }

  const fetchChatsWithNegativeFeedback = async (config: any) => {
    let chartData = {}
    try {
      const result = await axios.post(
        getNegativeFeedbackChats(),
        {
          events: '',
          start_date: config?.start,
          end_date: config?.end,
        },
        { withCredentials: true },
      )

      const response = result.data.response.map((entry: any) => ({
        ...translateChartKeys(entry, 'created'),
        dateTime: new Date(entry.created).getTime(),
      }))

      chartData = {
        chartData: response,
        colors: [
          { id: 'dateTime', color: '#FFB511' },
          { id: 'Ended', color: '#FFB511' },
        ],
      }
      setNegativeFeedbackChats(result.data.response)
    } catch (_) {
      //error
    }
    return chartData
  }

  return (
    <>
      <h1>{t('menu.feedback')}</h1>
      <OptionsPanel
        metricOptions={feedbackMetrics}
        dateFormat="yyyy-MM-dd"
        onChange={(config) => {
          setConfigs(config)
          configsSubject.next(config)
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
