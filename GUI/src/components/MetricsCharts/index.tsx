import { t } from 'i18next'
import React, { useState } from 'react'
import { MdOutlineDownload } from 'react-icons/md'
import { Button, Card, Icon, Track } from '../../components'
import DropDown from '../Dropdown'
import BarGraph from '../BarGraph'
import './MetricsCharts.scss'
import LineGraph from '../LineGraph'
import PieGraph from '../PieGraph'
import axios from 'axios'
import { getCsv } from '../../resources/api-constants'
import { saveAs } from 'file-saver'
import { format } from 'date-fns'

type Props = {
  title: any
  data: any
  dataKey: string
  startDate: string
  endDate: string
}

const MetricsCharts = ({ title, data, dataKey, startDate, endDate }: Props) => {
  const charts = ['Tulpdiagramm', 'Sektordiagramm', 'joondiagramm']
  const [selectedChart, setSelectedChart] = useState<string>('Tulpdiagramm')

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
        <Track>
          <h3 style={{ flex: 2 }}>{t(title)}</h3>
          <Button
            appearance="text"
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
          <DropDown
            options={charts}
            defaultValue="Tulpdiagramm"
            onChangeSelection={(value) => {
              setSelectedChart(value)
            }}
          ></DropDown>
        </Track>
      }
    >
      {selectedChart === 'Tulpdiagramm' && (
        <BarGraph
          dataKey={dataKey}
          data={data}
          startDate={startDate}
          endDate={endDate}
        />
      )}
      {selectedChart === 'Sektordiagramm' && (
        <PieGraph
          dataKey={dataKey}
          data={data}
        />
      )}
      {selectedChart === 'joondiagramm' && (
        <LineGraph
          dataKey={dataKey}
          data={data}
        />
      )}
    </Card>
  )
}

export default MetricsCharts
