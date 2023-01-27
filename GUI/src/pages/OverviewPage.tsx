import axios from 'axios'
import React, { useCallback, useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Button, Card, Drawer, Icon, Track } from '../components'
import DraggableListItem from '../components/overview/DraggableListItem'
import MainMetricsArea from '../components/overview/MainMetricsArea'
import { overviewMetricPreferences } from '../resources/api-constants'
import { OverviewMetricPreference } from '../types/overview-metrics'
import { reorderItem } from '../util/reorder-array'
import { MdEdit } from 'react-icons/md'

const OverviewPage: React.FC = () => {
  const [metricPreferences, setMetricPreferences] = useState<OverviewMetricPreference[]>([])
  const [drawerIsHidden, setDrawerIsHidden] = useState(false)

  useEffect(() => {
    fetchMetricPreferences().catch(console.error)
  }, [])

  const fetchMetricPreferences = async () => {
    const result = await axios.get(overviewMetricPreferences(), { withCredentials: true })
    setMetricPreferences(result.data.response)
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
        <h1>Overview</h1>
        <Button appearance="text" onClick={() => setDrawerIsHidden(false)}>
          <Icon icon={<MdEdit />} size="medium" />
          Muuda
        </Button>
      </Track>

      <Drawer
        onClose={() => setDrawerIsHidden(true)}
        title="Muuda vaadet"
        style={{ transform: drawerIsHidden ? 'translate(100%)' : 'none', width: '400px' }}
      >
        {metricPreferences.map((m, i) => renderList(m, i))}
      </Drawer>

      <MainMetricsArea
        metricPreferences={metricPreferences}
        saveReorderedMetric={saveReorderedMetric}
      ></MainMetricsArea>

      <Card header={<Track><h3>Vestluste koguarv</h3></Track>}>
        test 
      </Card>
    </DndProvider>
  )
}

export default OverviewPage
