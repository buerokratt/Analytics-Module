import { format } from 'date-fns'
import React, { useEffect, useRef, useState } from 'react'
import { BarChart, XAxis, CartesianGrid, YAxis, Tooltip, Legend, Bar } from 'recharts'
import { dateFormatter, getTicks } from '../../util/charts-utils'

type Props = {
  dataKey: string
  data: any
  startDate: string
  endDate: string
}

const BarGraph = ({ dataKey, startDate, endDate, data }: Props) => {
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
        margin={{ top: 20, right: 65, left: 10, bottom: 70 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          allowDuplicatedCategory={false}
          dataKey={dataKey}
          scale="time"
          tickFormatter={(value) => dateFormatter(value, startDate, endDate)}
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
        <Tooltip
          labelFormatter={(value) => `${format(new Date(value), 'dd-MM-yyyy')}`}
          wrapperStyle={{
            visibility: 'visible',
          }}
        />
        <Legend wrapperStyle={{ position: 'relative', marginTop: '20px' }} />
        {(data?.chartData?.length > 0 ?? false) &&
          Object.keys(data.chartData[0]).map((k, i) => {
            return k === `${dataKey}` ? null : (
              <Bar
                key={k}
                dataKey={k}
                type="monotone"
                stackId={dataKey}
                stroke={data.colors.find((e: any) => e.id == k)?.color ?? '#FFB511'}
                fill={data.colors.find((e: any) => e.id == k)?.color ?? '#FFB511'}
              />
            )
          })}
      </BarChart>
    </div>
  )
}

export default BarGraph
