import { t } from 'i18next'
import React, { useState } from 'react'
import { MdOutlineDownload } from 'react-icons/md'
import { Button, Card, Icon, Track } from '../../components'
import DropDown from '../Dropdown'
import OverviewLineChart from '../OverviewLineChart'
import './MetricsCharts.scss'

type Props = {
  title: any  
  data: any
}

const MetricsCharts = ({ title, data }: Props) => {

  const [showDropDown, setShowDropDown] = useState<boolean>(false);
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
        {data.length > 0 && selectedChart === 'Tulpdiagramm' && (
          <OverviewLineChart
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
