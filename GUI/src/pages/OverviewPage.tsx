import axios from 'axios'
import React, { useCallback, useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import DraggableListItem from '../components/overview/DraggableListItem'
import OverviewSidebar from '../components/overview/OverviewSidebar'
import { overviewMetricPreferences, overviewMetrics } from '../resources/api-constants'
import { OverviewMetricData, OverviewMetricPreference } from '../types/overview-metrics'

const OverviewPage: React.FC = () => {
  const [metricPreferences, setMetricPreferences] = useState<OverviewMetricPreference[]>([])
  const [metrics, setMetrics] = useState<OverviewMetricData[]>([])
  const [drawerIsHidden, setDrawerIsHidden] = useState(false)

  useEffect(() => {
    fetchMetricPreferences().catch(console.error)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => fetchMetrics(metricPreferences), 30000)
    return () => clearInterval(interval)
  }, [metricPreferences])

  const fetchMetricPreferences = async () => {
    const result = await axios.get(overviewMetricPreferences(), { withCredentials: true })

    setMetricPreferences(result.data.response)
    fetchMetrics(result.data.response)
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
    fetchMetrics(result.data.response)
  }

  const fetchMetrics = async (metricPreferences: OverviewMetricPreference[]) => {
    const metricsToFetch = metricPreferences.filter((m) => m.active)
    const results = await Promise.all(metricsToFetch.map((m) => axios.get(overviewMetrics(m.metric))))
    setMetrics(
      results.map((r, i) => ({
        metric: metricsToFetch[i].metric,
        data: {
          left: { value: r.data.response[0].metricValue, title: 'Left' },
          right: { value: r.data.response[1].metricValue, title: 'Right' },
        },
      })),
    )
  }

  const toggleMetricActive = (metric: OverviewMetricPreference) => {
    setMetricPreferences((metrics) => metrics.map((m) => (m === metric ? { ...metric, active: !metric.active } : m)))
    updateMetricPreference({ ...metric, active: !metric.active })
  }

  const saveReorderedMetric = useCallback((metric: OverviewMetricPreference, newIndex: number) => {
    updateMetricPreference({ ...metric, ordinality: newIndex })
  }, [])

  const moveMetric = useCallback(
    (item: number, target: number) => {
      setMetricPreferences((metrics) => {
        const prevMetrics = metrics.slice()
        const movingItem = prevMetrics.splice(item, 1)
        prevMetrics.splice(target, 0, movingItem[0])
        return prevMetrics
      })
    },
    [metricPreferences],
  )

  const renderList = useCallback(
    (m: OverviewMetricPreference, i: number) => (
      <DraggableListItem
        key={m.metric}
        metric={m}
        toggleMetricActive={toggleMetricActive}
        moveMetric={moveMetric}
        saveReorderedMetric={saveReorderedMetric}
        index={i}
      ></DraggableListItem>
    ),
    [],
  )

  const renderCards = useCallback(
    (m: OverviewMetricData, i: number) => (
      <div style={{ width: '100px', height: '50px', border: '1px solid black' }}>{m.data.left.value}</div>
    ),
    [],
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <h1>Overview</h1>
      <>
        <h3>Main Metrics</h3>
        <button onClick={() => setDrawerIsHidden(false)}>Muuda</button>
        <OverviewSidebar isHidden={drawerIsHidden} closeDrawer={() => setDrawerIsHidden(true)}>
          {metricPreferences.map((m, i) => renderList(m, i))}
        </OverviewSidebar>
        <div style={{ display: 'flex' }}>{metrics.map((m, i) => renderCards(m, i))}</div>
      </>
    </DndProvider>
  )
}

export default OverviewPage
