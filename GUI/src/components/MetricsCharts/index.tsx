import { useTranslation } from 'react-i18next'
import React, { useState } from 'react'
import { MdOutlineDownload } from 'react-icons/md'
import { Button, Card, FormSelect, Icon, Track } from '../../components'
import BarGraph from '../BarGraph'
import './MetricsCharts.scss'
import LineGraph from '../LineGraph'
import PieGraph from '../PieGraph'
import axios from 'axios'
import { getCsv } from '../../resources/api-constants'
import { saveAs } from 'file-saver'
import { format } from 'date-fns'
import { ChartType } from '../../types/chart-type'

type Props = {
  title: any
  data: any
  dataKey: string
  startDate: string
  endDate: string
}

const MetricsCharts = ({ title, data, dataKey, startDate, endDate }: Props) => {
  const { t } = useTranslation()

  const charts: ChartType[] = [
    {
      label: t('chart.barChart'),
      value: 'barChart',
    },
    {
      label: t('chart.pieChart'),
      value: 'pieChart',
    },
    {
      label: t('chart.lineChart'),
      value: 'lineChart',
    },
  ]
  const [selectedChart, setSelectedChart] = useState<string>('barChart')

  const downloadCSV = async (data: any[]) => {
    const res = await axios.post(
      getCsv(),
      {
        data: data.map((p) => ({ ...p, dateTime: format(new Date(p[dataKey]), 'yyyy-MM-dd hh:mm:ss a') })),
        del: '',
        qul: '',
      },
      { responseType: 'blob' },
    )
    saveAs(res.data, 'metrics.csv')
  }

  return (
    <Card
      header={
        <div className="container">
          <div className="title">
            <h3>{t(title)}</h3>
          </div>
          <div className="other_content">
            <Button
              appearance="text"
              style={{ marginRight: 15 }}
              onClick={() => {
                downloadCSV(data.chartData)
              }}
            >
              <Icon
                icon={<MdOutlineDownload />}
                size="small"
              />
              {t('feedback.csv')}
            </Button>
            <FormSelect
              name={''}
              label={''}
              defaultValue={'barChart'}
              options={charts}
              onSelectionChange={(value) => setSelectedChart(value?.value ?? 'barChart')}
            />
          </div>
        </div>
      }
    >
      {selectedChart === 'barChart' && (
        <BarGraph
          dataKey={dataKey}
          data={data}
          startDate={startDate}
          endDate={endDate}
        />
      )}
      {selectedChart === 'pieChart' && (
        <PieGraph
          dataKey={dataKey}
          data={data}
        />
      )}
      {selectedChart === 'lineChart' && (
        <LineGraph
          dataKey={dataKey}
          data={data}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </Card>
  )
}

export default MetricsCharts
