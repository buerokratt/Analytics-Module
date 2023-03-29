import axios from 'axios'
import React, { useCallback, useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'
import { MdEdit } from 'react-icons/md'
import { Button, Card, Drawer, Icon, Track } from '../components'
import DraggableListItem from '../components/overview/DraggableListItem'
import MainMetricsArea from '../components/overview/MainMetricsArea'
import LineGraph from '../components/LineGraph'
import { openSearchDashboard, overviewMetricPreferences, overviewMetrics } from '../resources/api-constants'
import { OverviewMetricPreference } from '../types/overview-metrics'
import { reorderItem } from '../util/reorder-array'
import { useCookies } from 'react-cookie'
import { formatDate } from '../util/charts-utils'

const OverviewPage: React.FC = () => {
  const [metricPreferences, setMetricPreferences] = useState<OverviewMetricPreference[]>([])
  const [chartData, setChartData] = useState({})
  const [drawerIsHidden, setDrawerIsHidden] = useState(true)
  const [cookies, setCookie] = useCookies();

  const chartKey = 'dateTime'
  const { t } = useTranslation()

  useEffect(() => {
    checkForCookie();
    fetchMetricPreferences().catch(console.error)
    fetchChartData().catch(console.error)

    const interval = setInterval(() => fetchChartData(), 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchMetricPreferences = async () => {
    const result = await axios.get(overviewMetricPreferences(), { withCredentials: true })
    setMetricPreferences(result.data.response)
  }

  const checkForCookie = () => {
    if (!(document.cookie.indexOf('test') > -1)) {
      setCookie('test', 1, { path: '/' });
    }
  }

  const fetchChartData = async () => {
    const result = await axios.get(overviewMetrics('chat-activity'))

    const response = result.data.response.map((entry: any) => ({
      ...translateChartKeys(entry),
      dateTime: new Date(entry.created).getTime(),
    }))

    const chartData = {
      chartData: response,
      colors: [
        { id: 'Chats started', color: `hsl(${0 * 20}, 80%, 45%)` },
        { id: 'Left with an answer', color: `hsl(${1 * 20}, 80%, 45%)` },
        { id: 'Left with no answer', color: `hsl(${2 * 20}, 80%, 45%)` },
        { id: 'Hate speech', color: `hsl(${3 * 20}, 80%, 45%)` },
        { id: 'Unspecified reason', color: `hsl(${4 * 20}, 80%, 45%)` },
        { id: 'Answered in other channel', color: `hsl(${5 * 20}, 80%, 45%)` }
      ],
    }
    setChartData(chartData);
  }

  const updateMetricPreference = async (metric: OverviewMetricPreference) => {
    const result = await axios.post(
      overviewMetricPreferences(),
      {
        metric: metric.metric,
        ordinality: metric.ordinality,
        active: metric.active,
      },
      { withCredentials: true },
    )
    setMetricPreferences(result.data.response)
  }

  const toggleMetricActive = (metric: OverviewMetricPreference) => {
    setMetricPreferences((metrics) => metrics.map((m) => (m === metric ? { ...metric, active: !metric.active } : m)))
    updateMetricPreference({ ...metric, active: !metric.active })
  }

  const saveReorderedMetric = useCallback((metric: OverviewMetricPreference, newIndex: number) => {
    updateMetricPreference({ ...metric, ordinality: newIndex })
  }, [])

  const moveMetric = (metric: string, target: number) => {
    setMetricPreferences((metrics) =>
      reorderItem<OverviewMetricPreference>(metrics, (m) => m.metric === metric, target),
    )
  }

  const translateChartKeys = (obj: any) =>
    Object.keys(obj).reduce(
      (acc, key) =>
        key === 'created'
          ? acc
          : {
            ...acc,
            ...{ [t(`chart.${key}`)]: obj[key] },
          },
      {},
    )

  const renderList = (m: OverviewMetricPreference, i: number) => (
    <DraggableListItem
      key={m.metric}
      metric={m}
      toggleMetricActive={toggleMetricActive}
      moveMetric={moveMetric}
      saveReorderedMetric={saveReorderedMetric}
      index={i}
    />
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <Track justify="between">
        <h1>{t('menu.overview')}</h1>
        <Button
          appearance="text"
          onClick={() => setDrawerIsHidden(false)}
        >
          <Icon
            icon={<MdEdit />}
            size="medium"
          />
          {t('overview.edit')}
        </Button>
      </Track>

      <Drawer
        onClose={() => setDrawerIsHidden(true)}
        title={t('overview.editView')}
        style={{ transform: drawerIsHidden ? 'translate(100%)' : 'none', width: '450px' }}
      >
        {metricPreferences.map((m, i) => renderList(m, i))}
      </Drawer>

      <MainMetricsArea
        metricPreferences={metricPreferences}
        saveReorderedMetric={saveReorderedMetric}
      />

      <Card
        header={
          <Track>
            <h3>{t('overview.totalChatsChart')}</h3>
          </Track>
        }
      >
        <LineGraph
          dataKey={chartKey}
          data={chartData}
          startDate={formatDate(new Date(), 'yyyy-MM-dd')}
          endDate={formatDate(new Date(), 'yyyy-MM-dd')}
        />
      </Card>

      <Card header={<h3>{t('overview.openSearchDashboard')}</h3>}>
        <Button onClick={() => window.open(openSearchDashboard)}>{t('overview.openSearch')}</Button>
      </Card>
    </DndProvider>
  )
}

export default OverviewPage
