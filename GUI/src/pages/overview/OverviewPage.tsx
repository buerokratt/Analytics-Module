import axios from 'axios'
import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Testing from '../../components/Testing'

interface MetricPreference {
  metric: string
  active: boolean
  ordinality: number
}

interface Metric {
  metric: string
  data: {
    left: {
      value: number
      title: string
    }
    right: {
      value: number
      title: string
    }
  }
}

const OverviewPage: React.FC = () => {
  const [metricPreferences, setMetricPreferences] = useState<MetricPreference[]>([])
  const [metrics, setMetrics] = useState<Metric[]>([])

  const getMetricPreferences = () => metricPreferences

  useEffect(() => {
    fetchMetricPreferences().catch(console.error)
  }, [])

  useEffect(() => {
    setInterval(() => fetchMetrics(getMetricPreferences()), 10000)
  }, [])

  const fetchMetricPreferences = async () => {
    const result = await axios.get('http://localhost:8080/overview/preferences', { withCredentials: true })

    setMetricPreferences(result.data.response)
    fetchMetrics(result.data.response)
  }

  const setMetricPreference = async (metric: MetricPreference) => {
    setMetricPreferences(metricPreferences.map((m) => (m.metric === metric.metric ? metric : m)))

    const result = await axios.post(
      'http://localhost:8080/overview/preferences',
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

  const fetchMetrics = async (metricPreferences: MetricPreference[]) => {
    const metricsToFetch = metricPreferences.filter((m) => m.active)
    const results = await Promise.all(
      metricsToFetch.map((m) => axios.get(`http://localhost:8080/overview/metrics?metric=${m.metric}`)),
    )
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

  const toggleMetricActive = (metric: MetricPreference) => {
    setMetricPreference({ ...metric, active: !metric.active })
  }

  return (
    <Layout>
      <h1>Overview</h1>
      <>
        <h3>Main Metrics</h3>
        <ul>
          {metricPreferences.map((m) => (
            <li key={m.metric}>
              <input type="checkbox" checked={m.active} onChange={() => toggleMetricActive(m)}></input> {m.metric}
            </li>
          ))}
        </ul>
        {metrics.map((m) => (
          <div key={m.metric}>
            <p>
              {m.metric} ({m.data.left.title} / {m.data.right.title})
            </p>
            <h4>
              {m.data.left.value} / {m.data.right.value}
            </h4>
          </div>
        ))}
      </>
    </Layout>
  )
}

export default OverviewPage
