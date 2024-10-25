import React, { useEffect, useRef, useState } from 'react';
import { LineChart, XAxis, Line, CartesianGrid, YAxis, Tooltip, Legend, Label } from 'recharts';
import {
  chartDataKey,
  dateFormatter,
  formatDate,
  formatTotalPeriodCount,
  getColor,
  getKeys,
  getTicks,
  round,
} from '../../util/charts-utils';
import { useTotalPeriodCounts } from '../../hooks/ useTotalPeriodCounts';

type Props = {
  data: any;
  startDate: string;
  endDate: string;
  unit?: string;
};

const LineGraph = ({ data, startDate, endDate, unit }: Props) => {
  const [width, setWidth] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const totalPeriodCounts = useTotalPeriodCounts(data.chartData, unit);

  useEffect(() => {
    const handleResize = () => {
      setWidth(ref.current?.clientWidth ?? 0);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const domain = [new Date(startDate).getTime(), new Date(endDate).getTime()];
  const ticks = getTicks(startDate, endDate, new Date(startDate), new Date(endDate), 5);

  return (
    <div ref={ref}>
      <LineChart
        width={width ?? 0}
        height={(width ?? 0) / 3.76}
        data={data.chartData}
        margin={{ top: 20, right: 65, left: 10, bottom: 70 }}
      >
        <Tooltip
          labelFormatter={(value) => {
            if (typeof value === 'number') {
              return `${formatDate(new Date(value), startDate == endDate ? 'HH:mm' : 'dd-MM-yyyy')}`;
            } else if (typeof value === 'string') {
              return value;
            }
            return '';
          }}
          formatter={(value) => {
            if (typeof value === 'number') {
              return round(value);
            } else if (typeof value === 'string') {
              return value;
            }
            return '';
          }}
          cursor={false}
        />
        <XAxis
          dataKey={chartDataKey}
          ticks={ticks}
          domain={domain}
          tickFormatter={(value) => dateFormatter(startDate, endDate, value)}
          scale="time"
          type="number"
          allowDuplicatedCategory={false}
          angle={35}
          dx={30}
          dy={26}
          minTickGap={0}
          interval={0}
        />
        <YAxis ticks={data.chartData && data.chartData.length > 0 ? undefined : [0]}>
          <Label
            dx={-25}
            angle={270}
            value={unit}
          />
        </YAxis>
        <Legend
          wrapperStyle={{ position: 'relative', marginTop: '20px' }}
          formatter={(value) => `${value}${formatTotalPeriodCount(totalPeriodCounts, value)}`}
        />
        <CartesianGrid stroke="#f5f5f5" />
        {data?.chartData?.length > 0 &&
          getKeys(data.chartData).map((k, i) => {
            return k === chartDataKey ? null : (
              <Line
                key={k}
                dataKey={k}
                type="monotone"
                stroke={getColor(data, k)}
                fill={getColor(data, k)}
              />
            );
          })}
        <Legend />
      </LineChart>
    </div>
  );
};

export default LineGraph;
