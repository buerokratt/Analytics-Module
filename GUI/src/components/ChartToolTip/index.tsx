import React from 'react'
import './ChartToolTip.scss'
import { TooltipProps } from 'recharts'
import { formatDate } from '../../util/charts-utils'

const ChartToolTip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active) {
    const currData = payload && payload.length ? payload[0].payload : null
    return (
      <div className="chart_tool_tip">
        <p>{currData ? formatDate(new Date(currData.date), 'dd-MM-yyyy') : ' -- '}</p>
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
