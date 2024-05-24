import React from 'react'
import { TooltipProps } from 'recharts'
import './PercentageToolTip.scss'

const PercentageToolTip = ({ active, payload }: TooltipProps<number, string>) => {

  const currData = payload?.[0]?.payload?.payload ?? {};

  if (!active) {
    return <></>
  }
  
  return (
    <div className="percentage_tool_tip">
      <label>{`${currData?.name} : ${currData?.value}%`}</label>
    </div>
  )
}

export default PercentageToolTip
