import axios from 'axios'
import React, { useCallback, useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'
import { MdEdit } from 'react-icons/md'
import { Button, Card, Drawer, Icon, Track } from '../components'
import DraggableListItem from '../components/overview/DraggableListItem'
import MainMetricsArea from '../components/overview/MainMetricsArea'
import OverviewLineChart from '../components/OverviewLineChart'
import { overviewMetricPreferences, overviewMetrics } from '../resources/api-constants'
import { OverviewMetricPreference } from '../types/overview-metrics'
import { reorderItem } from '../util/reorder-array'

const OverviewPage: React.FC = () => {
  const [metricPreferences, setMetricPreferences] = useState<OverviewMetricPreference[]>([])
  const [chartData, setChartData] = useState([])
  const [drawerIsHidden, setDrawerIsHidden] = useState(false)

  const { t } = useTranslation()

  useEffect(() => {
    fetchMetricPreferences().catch(console.error)
    fetchChartData().catch(console.error)

    const interval = setInterval(() => fetchChartData(), 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchMetricPreferences = async () => {
    const result = await axios.get(overviewMetricPreferences(), { withCredentials: true })
    setMetricPreferences(result.data.response)
  }

  const fetchChartData = async () => {
    const result = await axios.get(overviewMetrics('chat-activity'))
    setChartData(result.data.response)
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
              ...{ [t(`overview.chart.${key}`)]: obj[key] },
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
    ></DraggableListItem>
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <Track justify="between">
        <h1>{t('menu.overview')}</h1>
        <Button appearance="text" onClick={() => setDrawerIsHidden(false)}>
          <Icon icon={<MdEdit />} size="medium" />
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
      ></MainMetricsArea>

      <Card
        header={
          <Track>
            <h3>{t('overview.totalChatsChart')}</h3>
          </Track>
        }
      >
        {chartData.length > 0 && (
          <OverviewLineChart
            data={chartData.map((entry: any) => ({
              ...translateChartKeys(entry),
              created: new Date(entry.created).toLocaleTimeString('default'),
            }))}
          ></OverviewLineChart>
        )}
      </Card>
    </DndProvider>
  )
}

export default OverviewPage
