import React, { useEffect, useRef, useState } from 'react'
import { PieChart, Cell, Pie } from 'recharts'
import Track from '../Track'

type Props = {
  data: any
  dataKey: string
}

const PieGraph = ({ data, dataKey }: Props) => {
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
    <PieChart width={width / 2} height={width / 2.8} data={data} margin={{top: 20, right: 30, left: 20, bottom: 5 }} >
      <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={200}
            fill="#8884d8"
            dataKey={dataKey}
          >
          {data.length > 0 && Object.keys(data[0]).map((k, i) => {
          return k === `${{dataKey}}` ? null : (
            <Cell key={`line-${i}`} type="monotone" stroke={`hsl(${i * 20}, 80%, 45%)`} fill={'#0088FE'} />
          )
        })}
           
       </Pie>
    </PieChart>
     <Track direction='vertical' isMultiline={true}>
       <label>data</label>
     </Track>
    </Track>
    </div>
  );
}

export default PieGraph