import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators'
import OptionsPanel from '../../components/MetricAndPeriodOptions'
import { MetricOptionsState } from '../../components/MetricAndPeriodOptions/types'
import MetricsCharts from '../../components/MetricsCharts'
import { chartDateFormat, formatDate } from '../../util/charts-utils'
import { fetchData } from './data'
import { metricOptions } from './options'

const BurokrattPage: React.FC = () => {
  const { t } = useTranslation()
  const [tableTitleKey, setTableTitleKey] = useState(metricOptions[0].labelKey)
  const [configs, setConfigs] = useState<MetricOptionsState>()
  const [chartData, setChartData] = useState([])
  const [unit, setUnit] = useState(metricOptions[0].unit)

  const [configsSubject] = useState(() => new Subject())
  useEffect(() => {
    const subscription = configsSubject
      .pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(fetchData),
      )
      .subscribe((data: any) => data && setChartData(data))

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      <h1>{t('menu.burokratt')}</h1>
      <OptionsPanel
        metricOptions={metricOptions}
        onChange={(config) => {
          setConfigs(config)
          configsSubject.next(config)
          const selectedOption = metricOptions.find((x) => x.id === config.metric)
          if (!selectedOption) return;
          setTableTitleKey(selectedOption.labelKey)
          setUnit(selectedOption.unit)
        }}
        dateFormat={chartDateFormat}
      />
      <MetricsCharts
        title={tableTitleKey}
        data={chartData}
        startDate={configs?.start ?? formatDate(new Date(), chartDateFormat)}
        endDate={configs?.end ?? formatDate(new Date(), chartDateFormat)}
        groupByPeriod={configs?.groupByPeriod ?? 'day'}
        unit={unit}
      />
    </>
  )
}

export default BurokrattPage
