import React from 'react';
import { format } from 'date-fns';
import { TooltipProps } from 'recharts';
import { chartDataKey, round } from '../../util/charts-utils';
import './ChartToolTip.scss';

const ChartToolTip = ({ active, payload }: TooltipProps<number, string>) => {

  const currData = payload?.[0]?.payload?.payload ?? {};

  if (!active) {
    return <></>
  }

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
};

export default ChartToolTip;
