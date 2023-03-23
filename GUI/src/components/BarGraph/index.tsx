import React, { useEffect, useRef, useState } from 'react'
import { BarChart, XAxis, CartesianGrid, YAxis, Tooltip, Legend, Bar } from 'recharts'
import { dateFormatter, formatDate, getColor, getTicks } from '../../util/charts-utils'
import { GroupByPeriod } from '../MetricAndPeriodOptions/types'

type Props = {
  dataKey: string
  data: any
  startDate: string
  endDate: string
  groupByPeriod: GroupByPeriod
}

const BarGraph = ({ dataKey, startDate, endDate, data, groupByPeriod }: Props) => {
  const [width, setWidth] = useState<number>(10)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      setWidth(ref.current?.clientWidth ?? 0)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  let minData = new Date(startDate).getTime()
  if (groupByPeriod === 'day') {
    const millisecondInOneDay = 24 * 60 * 60 * 1000;
    minData = minData - millisecondInOneDay;
  }

  const domain = [minData, new Date(endDate).getTime()]
  const ticks = getTicks(startDate, endDate, new Date(startDate), new Date(endDate), 5)

  return (
    <div ref={ref}>
      <BarChart
        width={width}
        height={width / 2.8}
        data={data.chartData}
        margin={{ top: 20, right: 65, left: 10, bottom: 70 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={dataKey}
          scale="time"
          tickFormatter={(value) => dateFormatter(startDate, endDate, value)}
          type="number"
          domain={domain}
          ticks={ticks}
          angle={35}
          dx={30}
          dy={26}
          minTickGap={0}
          interval={0}
        />
        <YAxis />
        <Tooltip labelFormatter={(value) => `${formatDate(new Date(value), 'dd-MM-yyyy')}`} />
        <Legend wrapperStyle={{ position: 'relative', marginTop: '20px' }} />
        {(data?.chartData?.length > 0 ?? false) &&
          Object.keys(data.chartData[0]).map((k, i) => {
            return k === `${dataKey}` ? null : (
              <Bar
                key={k}
                dataKey={k}
                type="monotone"
                stackId={dataKey}
                stroke={getColor(data, k)}
                fill={getColor(data, k)}
              />
            )
          })}
        <Tooltip />
      </BarChart>
    </div>
  )
}

export default BarGraph
