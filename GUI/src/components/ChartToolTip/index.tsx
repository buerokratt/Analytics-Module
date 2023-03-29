import React from 'react'
import './ChartToolTip.scss'
import { format } from 'date-fns'
import { TooltipProps } from 'recharts'
import { chartDataKey, round } from '../../util/charts-utils'

const ChartToolTip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active) {
    const currData = payload && payload.length ? payload[0].payload.payload : null
    return (
      <div className="chart_tool_tip">
        {Object.keys(currData).map((key, k) => (
          <p key={k}>
            {key === chartDataKey || key === 'created'
              ? format(new Date(currData[chartDataKey]), 'yyyy-MM-dd')
              : `${key}: ${round(currData[key])}`}
          </p>
        ))}
      </div>
    )
  }

  return null
}

export default ChartToolTip
