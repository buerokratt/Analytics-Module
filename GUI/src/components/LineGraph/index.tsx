import { format } from 'date-fns'
import React, { useEffect, useRef, useState } from 'react'
import { LineChart, XAxis, Line, CartesianGrid, YAxis, Tooltip, Legend } from 'recharts'

type Props = {
  dataKey: string
  data: any
}

const LineGraph = ({ data, dataKey }: Props) => {
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

  return (
    <div ref={ref}>
      <LineChart
        width={width}
        height={width / 3.86}
        data={data.chartData}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <Tooltip labelFormatter={(value) => `${format(new Date(value), 'dd-MM-yyyy')}`} />
        <XAxis dataKey={dataKey} />
        <YAxis />
        <CartesianGrid stroke="#f5f5f5" />
        {(data?.chartData?.length > 0 ?? false) &&
          Object.keys(data.chartData[0]).map((k, i) => {
            return k === `${dataKey}` ? null : (
              <Line
                key={k}
                dataKey={k}
                type="monotone"
                stroke={data.colors.find((e: any) => e.id == k)?.color ?? '#FFB511'}
                fill={data.colors.find((e: any) => e.id == k)?.color ?? '#FFB511'}
              />
            )
          })}
        <Legend />
      </LineChart>
    </div>
  )
}

export default LineGraph
