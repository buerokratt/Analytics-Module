import axios from 'axios'
import React, { useCallback, useEffect, useState } from 'react'
import { overviewMetrics } from '../../../resources/api-constants'
import { OverviewMetricData, OverviewMetricPreference } from '../../../types/overview-metrics'
import { reorderItem } from '../../../util/reorder-array'
import DraggableCard from '../DraggableCard'
import './styles.scss'

type Props = {
  metricPreferences: OverviewMetricPreference[]
  saveReorderedMetric: (metric: OverviewMetricPreference, newIndex: number) => void
}

const MainMetricsArea = ({ metricPreferences, saveReorderedMetric }: Props) => {
  const [metrics, setMetrics] = useState<OverviewMetricData[]>([])

  useEffect(() => {
    if (metricPreferences.length > 0) fetchMetrics(metricPreferences)
    const interval = setInterval(() => fetchMetrics(metricPreferences), 30000)
    return () => clearInterval(interval)
  }, [metricPreferences])

  const fetchMetrics = async (metricPreferences: OverviewMetricPreference[]) => {
    const metricsToFetch = metricPreferences.filter((m) => m.active)

    const noRemovedMetrics = metrics.every((m) => metricsToFetch.find((mf) => mf.metric === m.metric))
    const noNewMetrics = metricsToFetch.every((mf) => metrics.find((m) => mf.metric === m.metric))
    if (noRemovedMetrics && noNewMetrics) {
      setMetrics(
        metricsToFetch.map((r) => ({
          metric: r.metric,
          data: {
            left: metrics.find((m) => m.metric === r.metric)!.data.left,
            right: metrics.find((m) => m.metric === r.metric)!.data.right,
          },
        })),
      )
      return
    }

    const promises = metricsToFetch.map((m) => axios.get(overviewMetrics(m.metric)))
    const results = await Promise.all(promises)
    setMetrics(
      results.map((r, i) => ({
        metric: metricsToFetch[i].metric,
        data: {
          left: r.data.response[0].metricValue,
          right: r.data.response[1].metricValue,
        },
      })),
    )
  }

  const moveMetric = (metric: string, target: number) => {
    setMetrics((metrics) => {
      return reorderItem<OverviewMetricData>(metrics, (m) => m.metric === metric, target)
    })
  }

  const renderCards = useCallback(
    (mData: OverviewMetricData, i: number) => {
      const matchMetricPreference = metricPreferences.find((m) => m.metric === mData.metric)
      if (!matchMetricPreference) return
      return (
        <DraggableCard
          key={mData.metric}
          index={i}
          metric={matchMetricPreference}
          metricData={mData}
          moveMetric={moveMetric}
          saveReorderedMetric={saveReorderedMetric}
        />
      )
    },
    [metricPreferences, saveReorderedMetric],
  )

  return <div className="main-metrics-area">{metrics.map((m, i) => renderCards(m, i))}</div>
}

export default MainMetricsArea
