import React, { useEffect, useRef, useState } from 'react'
import { BarChart, XAxis, CartesianGrid, YAxis, Tooltip, Legend, Bar } from 'recharts'

type Props = {
  dataKey: string
  data: any
}

const BarGraph = ({ data, dataKey }: Props) => {
  const [width, setWidth] = useState<number>(10)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      console.log(ref.current?.clientWidth ?? 0);
      setWidth(ref.current?.clientWidth ?? 0)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return (
    <div ref={ref}>
    <BarChart width={width} height={width / 2.8} data={data} margin={{top: 20, right: 30, left: 20, bottom: 5 }} >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={dataKey} />
      <YAxis />
      <Tooltip />
      <Legend />
      {data.length > 0 && (Object.keys(data[0]).map((k, i) => {
          return k === `${{dataKey}}` ? null : (
            <Bar key={`line-${i}`} type="monotone" dataKey={k} stroke={`hsl(${i * 20}, 80%, 45%)`} yAxisId={0} />
          )
      }))}
    </BarChart>
    </div>
  );
}

export default BarGraph