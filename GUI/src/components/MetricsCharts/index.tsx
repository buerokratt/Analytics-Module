import { t } from 'i18next'
import React, { useState } from 'react'
import { MdOutlineDownload } from 'react-icons/md'
import { Button, Card, Icon, Track } from '../../components'
import DropDown from '../Dropdown'
import BarGraph from '../BarGraph'
import './MetricsCharts.scss'
import LineGraph from '../LineGraph'
import PieGraph from '../PieGraph'

type Props = {
  title: any  
  data: any
  dataKey: string
}

const MetricsCharts = ({ title, dataKey, data }: Props) => {
  const charts = ['Tulpdiagramm', 'Sektordiagramm', 'joondiagramm'];
  const [selectedChart, setSelectedChart] = useState<string>('Tulpdiagramm');

  const translateChartKeys = (obj: any) =>
  Object.keys(obj).reduce(
    (acc, key) =>
        key === 'created'
          ? acc
          : {
              ...acc,
              ...{ [t(`overview.chart.${key}`)]: obj[key] },
            },
      {},
  )

  return (
    <Card
        header={
          <Track>
            <h3 style={{ flex: 2 }}>{t(title)}</h3>
            <Button appearance="text" onClick={() => {}}>
             <Icon icon={<MdOutlineDownload />} size='small' />
               {t('feedback.csv')}
            </Button>
           <DropDown options={charts} defaultValue='Tulpdiagramm' onChangeSelection={(value) => {setSelectedChart(value)}}></DropDown>
          </Track>
        } >
        {selectedChart === 'Tulpdiagramm' && (
          <BarGraph
          dataKey={dataKey}
            data={data.map((entry: any) => ({
              ...translateChartKeys(entry),
              created: new Date(entry.created).toLocaleTimeString('default'),
            }))}
          />
        )}
        {selectedChart === 'Sektordiagramm' && (
          <PieGraph
            data={data.map((entry: any) => ({
              ...translateChartKeys(entry),
              created: new Date(entry.created).toLocaleTimeString('default'),
            }))}
          />
        )}
        {selectedChart === 'joondiagramm' && (
          <LineGraph
            data={data.map((entry: any) => ({
              ...translateChartKeys(entry),
              created: new Date(entry.created).toLocaleTimeString('default'),
            }))}
          />
        )}
      </Card>
  )
}

export default MetricsCharts
