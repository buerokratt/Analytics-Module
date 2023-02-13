import { format } from 'date-fns'
import React, { useEffect, useRef, useState } from 'react'
import { PieChart, Cell, Pie, Tooltip } from 'recharts'
import Track from '../Track'

type Props = {
  dataKey: string
  data: any
}

const PieGraph = ({ dataKey, data }: Props) => {
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
      <Track>
        <PieChart
          width={width / 2}
          height={width / 2.8}
          data={data.chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <Pie
            data={data.chartData}
            cx="50%"
            cy="50%"
            outerRadius={200}
            fill="#8884d8"
            dataKey={dataKey}
          >
            {(data?.chartData?.length > 0 ?? false) &&
              Object.keys(data.chartData[0]).map((k, i) => {
                return k === `${dataKey}` ? null : (
                  <Cell
                    key={k}
                    type="monotone"
                    stroke={data.colors.find((e: any) => e.id == k)?.color ?? '#FFB511'}
                    fill={data.colors.find((e: any) => e.id == k)?.color ?? '#FFB511'}
                  />
                )
              })}
          </Pie>
        </PieChart>
        <Track
          direction="vertical"
          flex={0}
          align="left"
          isFlex={true}
          isMultiline={true}
        >
          {(data?.chartData?.length > 0 ?? false) &&
            Object.keys(data.chartData[0]).map((k, i) => {
              return k === `${dataKey}` ? null : (
                <label color={data.colors.find((e: any) => e.id == k)?.color ?? '#FFB511'}>{k}</label>
              )
            })}
        </Track>
      </Track>
    </div>
  )
}

export default PieGraph
