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

  const translateChartKeys = (obj: any) =>
    Object.keys(obj).reduce(
      (acc, key) =>
        key === 'dateTime'
          ? acc
          : {
              ...acc,
              ...{ [t(`chart.${key}`)]: obj[key] },
            },
      {},
    )

  const downloadCSV = async (data: any) => {
    const res = await axios.post(
      getCsv(),
      {
        data: data,
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
              downloadCSV(data)
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
          // data={data}
          startDate={startDate}
          endDate={endDate}
          data={data.map((entry: any) => ({
            ...translateChartKeys(entry),
            dateTime: new Date(entry.dateTime).getTime(),
          }))}
        />
      )}
      {selectedChart === 'Sektordiagramm' && (
        <PieGraph
          dataKey={dataKey}
          data={data}
          // data={data.map((entry: any) => ({
          //   ...translateChartKeys(entry),
          //   dateTime: new Date(entry.created).toLocaleTimeString('default'),
          // }))}
        />
      )}
      {selectedChart === 'joondiagramm' && (
        <LineGraph
          dataKey={dataKey}
          data={data}
          // data={data.map((entry: any) => ({
          //   // ...translateChartKeys(entry),
          //   created: new Date(entry.created).toLocaleTimeString('default'),
          // }))}
        />
      )}
    </Card>
  )
}

export default MetricsCharts
