import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators'
import OptionsPanel from '../../components/MetricAndPeriodOptions'
import { MetricOptionsState } from '../../components/MetricAndPeriodOptions/types'
import MetricsCharts from '../../components/MetricsCharts'
import { chartDateFormat, formatDate } from '../../util/charts-utils'
import { fetchData } from './data'
import { chatOptions } from './options'

const ChatsPage: React.FC = () => {
  const { t } = useTranslation()
  const [tableTitleKey, setTableTitleKey] = useState(chatOptions[0].labelKey)
  const [configs, setConfigs] = useState<MetricOptionsState & { groupByPeriod: string }>()
  const [chartData, setChartData] = useState([])

  const [configsSubject] = useState(() => new Subject())
  useEffect(() => {
    const subscription = configsSubject
      .pipe(distinctUntilChanged(), debounceTime(500), switchMap(fetchData))
      .subscribe((data: any) => data && setChartData(data))

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      <h1>{t('menu.chats')}</h1>
      <OptionsPanel
        metricOptions={chatOptions}
        dateFormat={chartDateFormat}
        onChange={(config) => {
          setConfigs(config)
          configsSubject.next(config)
          const tableTitleKey = chatOptions.find((x) => x.id === config.metric)?.labelKey
          if (tableTitleKey) setTableTitleKey(tableTitleKey)
        }}
      />
      <MetricsCharts
        title={tableTitleKey}
        data={chartData}
        dataKey="dateTime"
        startDate={configs?.start ?? formatDate(new Date(), chartDateFormat)}
        endDate={configs?.end ?? formatDate(new Date(), chartDateFormat)}
      />
    </>
  )
}

export default ChatsPage
