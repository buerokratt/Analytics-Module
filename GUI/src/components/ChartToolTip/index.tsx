import React from 'react'
import { format } from 'date-fns'
import './ChartToolTip.scss'
import { TooltipProps } from 'recharts'

const ChartToolTip = ({ active, payload, label }: TooltipProps<number, string>) => {
  console.log(payload)
  console.log(active)
  if (active) {
    const currData = payload && payload.length ? payload[0].payload : null
    return (
      <div className="chart_tool_tip">
        <p>{currData ? format(new Date(currData.date), 'dd-MM-yyyy') : ' -- '}</p>
        <p>
          {'value : '}
          <em>{currData ? currData.val : ' -- '}</em>
        </p>
      </div>
    )
  }

  return null
}

export default ChartToolTip
