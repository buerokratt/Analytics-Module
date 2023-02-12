import React from 'react'
import { format } from 'date-fns'

const style = {
  padding: 6,
  backgroundColor: '#fff',
  border: '1px solid #ccc',
}

const ChartTooltip = (props: { active: any; payload: any; dataKey: string }) => {
  const { active, payload, dataKey } = props
  if (active) {
    const currData = payload && payload.length ? payload[0].payload : null
    return (
      <div style={style}>
        <p>{currData ? format(new Date(currData[dataKey]), 'yyyy-MM-dd') : ' -- '}</p>
        <p>
          {'value : '}
          <em>{currData ? currData.val : ' -- '}</em>
        </p>
      </div>
    )
  }

  return null
}

export default ChartTooltip
