import axios from 'axios'
import React, { useCallback, useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Card, Drawer, Track } from '../components'
import DraggableCard from '../components/overview/DraggableCard'
import DraggableListItem from '../components/overview/DraggableListItem'
import MainMetricsArea from '../components/overview/MainMetricsArea'
import { overviewMetricPreferences, overviewMetrics } from '../resources/api-constants'
import { OverviewMetricData, OverviewMetricPreference } from '../types/overview-metrics'
import { reorderItem } from '../util/reorder-array'

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
      <h1>Overview</h1>
      <>
        <button onClick={() => setDrawerIsHidden(false)}>Muuda</button>
        <Drawer
          onClose={() => setDrawerIsHidden(true)}
          title="Muuda vaadet"
          style={{ transform: drawerIsHidden ? 'translate(100%)' : 'none', width: '300px' }}
        >
          {metricPreferences.map((m, i) => renderList(m, i))}
        </Drawer>
        <MainMetricsArea
          metricPreferences={metricPreferences}
          saveReorderedMetric={saveReorderedMetric}
        ></MainMetricsArea>
      </>
    </DndProvider>
  )
}

export default OverviewPage
