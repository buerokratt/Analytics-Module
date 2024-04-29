import React from 'react'
import './PercentageToolTip.scss'
import { TooltipProps } from 'recharts'

const PercentageToolTip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active) {
        const currData = payload && payload.length ? payload[0].payload.payload : null
        return (
            <div className="percentage_tool_tip">
                <label>{`${currData.name} : ${currData.value}%`}</label>
            </div>
        )
    }

    return null
}

export default PercentageToolTip
