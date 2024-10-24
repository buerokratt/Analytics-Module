import React from 'react';
import { getColor } from '../../util/charts-utils';
import Track from '../Track';
import './PieGraph.scss';

type Props = {
  data: any;
  percentages: any;
};

const PieCharLegends = ({ data, percentages }: Props) => {
  console.log('percentages', percentages);
  console.log('data', data);

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
            <label style={{ color, maxLines: 1 }}>{`${e.name}: ${e.value} %`}</label>
          </Track>
        );
      })}
    </Track>
  );
};

export default PieCharLegends;
