import { add, differenceInCalendarDays, differenceInHours, format } from 'date-fns'
import React, { useEffect, useRef, useState } from 'react'
import { BarChart, XAxis, CartesianGrid, YAxis, Tooltip, Legend, Bar } from 'recharts'

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

  // console.log(data)

  const startDatee = new Date('2023-01-11')
  const endDatee = new Date('2023-02-10')

  const getTicks = (start: Date, end: Date, skip: number) => {
    const ticks = [start.getTime()]
    const inDays: boolean = startDatee !== endDatee

    const diff = inDays
      ? differenceInCalendarDays(end, start)
      : differenceInHours(new Date(`${startDatee} 24:00:00`), new Date(`${startDatee} 00:00:00`))
    const num = inDays ? (diff <= 30 ? diff : skip) : diff

    const current = start,
      velocity = Math.round(diff / (num - 1))

    for (let i = 1; i < num - 1; i++) {
      ticks.push(
        add(current, { days: inDays ? i * velocity : undefined, hours: inDays ? undefined : i * velocity }).getTime(),
      )
    }

    ticks.push(end.getTime())

    return ticks
  }

  const dateFormatter = (date: string) => {
    return format(new Date(date), startDate === endDate ? 'hh:mm a' : 'dd-MM-yyyy')
  }

  const domain = [new Date(startDate).getTime(), new Date(endDate).getTime()]
  const ticks = getTicks(new Date(startDate), new Date(endDate), 5)

  console.log(data)

  const dataa = [
    { dateTime: 1674086400000, Count: 3, Event: 'answered', color: '#9F2B68' },
    {
      dateTime: 1673568000000,
      Count: 1,
      Event: 'terminated',
      color: '#0088FE',
    },
    {
      dateTime: 1675382400000,
      Count: 2,
      Event: 'answered',
      color: '#00C49F',
    },
    {
      dateTime: 1675382400000, //new Date(2023, 0, 18).getTime(),
      Count: 5,
      Event: 'terminated',
      color: '#FF8042',
    },
    {
      dateTime: 1674172800000, //new Date(2023, 0, 25).getTime(),
      Count: 7,
      Event: 'answered',
      color: '#FFBB28',
    },
  ]

  return (
    <div ref={ref}>
      <BarChart
        width={width}
        height={width / 2.8}
        data={dataa}
        margin={{ top: 20, right: 65, left: 10, bottom: 70 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          allowDuplicatedCategory={false}
          dataKey="dateTime"
          scale="time"
          tickFormatter={dateFormatter}
          // type="number"
          type="category"
          domain={domain}
          ticks={ticks}
          angle={35}
          dx={30}
          dy={26}
          minTickGap={0}
          interval={0}
        />
        <YAxis />
        <Tooltip />
        <Legend wrapperStyle={{ position: 'relative', marginTop: '20px' }} />
        {/* <Bar
          type="monotone"
          dataKey="Count"
          stackId="a"
          stroke="#ff7300"
          fill="#ff7300"
          fillOpacity={0.9}
        /> */}
        {dataa.length > 0 &&
          Object.keys(dataa[0]).map((k, i) => {
            console.log(`${i} ${dataa[i].dateTime}`)
            return k === 'dateTime' ? null : (
              <Bar
                // key={`line-${i}`}
                type="monotone"
                stackId={dataa[i].dateTime}
                dataKey={k}
                stroke={dataa[i].color}
                fill={dataa[i].color}
                // yAxisId={0}
              />
            )
          })}
        {/* <Bar
          type="monotone"
          dataKey="val"
          stackId="a"
          stroke="#ff7300"
          fill="#ff7300"
          fillOpacity={0.9}
        />
        <Bar
          type="monotone"
          dataKey="val"
          stackId="a"
          stroke="#9F2B68"
          fill="#9F2B68"
          fillOpacity={0.9}
        /> */}
      </BarChart>
    </div>
  )
}

export default BarGraph
