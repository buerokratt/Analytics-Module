import React, { useEffect, useRef, useState } from 'react'
import { BarChart, XAxis, CartesianGrid, YAxis, Tooltip, Legend, Bar, Label } from 'recharts'
import { chartDataKey, dateFormatter, formatDate, getColor, getTicks, round } from '../../util/charts-utils'

type Props = {
  data: any
  startDate: string
  endDate: string
  unit?: string
}

const BarGraph = ({ startDate, endDate, data, unit }: Props) => {
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

  const domain = [new Date(startDate).getTime(), new Date(endDate).getTime()]
  const ticks = getTicks(startDate, endDate, new Date(startDate), new Date(endDate), 5)

  return (
    <div ref={ref}>
      <BarChart
        width={width}
        height={width / 2.8}
        data={data.chartData}
        margin={{ top: 20, right: 65, bottom: 70 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={chartDataKey}
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
        <YAxis>
          <Label
            dx={-20}
            angle={270}
            value={unit}
          />
        </YAxis>
        <Tooltip
          labelFormatter={(value) => `${formatDate(new Date(value), 'dd-MM-yyyy')}`}
          formatter={(value) => `${(round(value))} ${unit}`}
        />
        <Legend wrapperStyle={{ position: 'relative', marginTop: '20px' }} />
        {(data?.chartData?.length > 0 ?? false) &&
          Object.keys(data.chartData[0]).map((k, i) => {
            return k === chartDataKey ? null : (
              <Bar
                key={k}
                dataKey={k}
                type="monotone"
                stackId={chartDataKey}
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
