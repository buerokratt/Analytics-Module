import React from 'react';
import './ChartToolTip.scss';
import { format } from 'date-fns';
import { TooltipProps } from 'recharts';
import { chartDataKey, round } from '../../util/charts-utils';

const ChartToolTip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active) {
    const currData = payload?.length ? payload[0].payload.payload : null;
    return (
      <div className="chart_tool_tip">
        {Object.keys(currData).map((key, k) => {
          const value = typeof currData[key] === 'number' ? round(currData[key]) : currData[key];
          return (
            <p key={`${key}-${k}`}>
              {key === chartDataKey || key === 'created'
                ? format(new Date(currData[chartDataKey]), 'yyyy-MM-dd')
                : `${key}: ${value}`}
            </p>
          );
        })}
      </div>
    );
  }

  return null;
};

export default ChartToolTip;
