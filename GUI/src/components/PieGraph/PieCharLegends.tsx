import React from 'react';
import { formatTotalPeriodCount, getColor } from '../../util/charts-utils';
import Track from '../Track';
import './PieGraph.scss';
import { useTotalPeriodCounts } from '../../hooks/ useTotalPeriodCounts';

type Props = {
  data: any;
  percentages: any;
  unit?: string;
};

const PieCharLegends = ({ data, percentages, unit }: Props) => {
  const totalPeriodCounts = useTotalPeriodCounts(data.chartData, unit);

  return (
    <Track
      direction="vertical"
      flex={20}
      align="left"
      isFlex
      isMultiline
    >
      {percentages?.map((e: any) => {
        const color = getColor(data, e.name);

        return (
          <Track key={`track-${e.name}`}>
            <div
              className="legend_circle"
              style={{ backgroundColor: color }}
            />
            <label style={{ color, maxLines: 1 }}>
              {`${e.name}: ${e.value} %${formatTotalPeriodCount(totalPeriodCounts, e.name)}`}
            </label>
          </Track>
        );
      })}
    </Track>
  );
};

export default PieCharLegends;
