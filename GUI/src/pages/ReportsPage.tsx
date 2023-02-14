import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '../components'
import OptionsPanel from '../components/MetricAndPeriodOptions'
import MetricOptionsGroup, { Option } from '../components/MetricAndPeriodOptions'

const ReportsPage = () => {
  const { t } = useTranslation()

  const openDataOptions: Option[] = [
    {
      id: 'openDataMetrics',
      labelKey: '',
      subOptions: [
        { id: 'option1', labelKey: 'general.option1', color: '#f00' },
        { id: 'option2', labelKey: 'general.option2', color: '#0f0' },
      ],
    },
  ]

  return (
    <>
      <h1>{t('menu.reports')}</h1>
      <Card>
        <OptionsPanel
          metricOptions={openDataOptions}
          onChange={() => {}}
        ></OptionsPanel>
      </Card>
    </>
  )
}

export default ReportsPage
