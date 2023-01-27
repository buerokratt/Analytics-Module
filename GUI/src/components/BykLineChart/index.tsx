import React, { useEffect, useRef, useState } from 'react'
import { LineChart, XAxis, Line, CartesianGrid, YAxis, Tooltip, Legend } from 'recharts'

type Props = {
  data: any
}

const BykLineChart = ({ data }: Props) => {
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
      <LineChart width={width} height={width / 3.86} data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <Tooltip />
        <XAxis dataKey="date" />
        <YAxis />
        <CartesianGrid stroke="#f5f5f5" />
        {Object.keys(data[0]).map((k, i) => {
          return i === 0 ? null : (
            <Line key={`line-${i}`} type="monotone" dataKey={k} stroke={`hsl(${i * 20}, 80%, 45%)`} yAxisId={0} />
          )
        })}
        <Legend />
      </LineChart>
    </div>
  )
}

export default BykLineChart
