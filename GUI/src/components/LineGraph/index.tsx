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
} from '../../util/charts-utils';
import { ChartData } from 'types/chart';
import { usePeriodStatisticsContext } from 'hooks/usePeriodStatisticsContext';
import { CustomChartTooltip } from 'components';

type Props = {
  data: ChartData;
  startDate: string;
  endDate: string;
  unit?: string;
};

const LineGraph = ({ data, startDate, endDate, unit }: Props) => {
  const [width, setWidth] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { periodStatistics } = usePeriodStatisticsContext();

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
          content={
            <CustomChartTooltip
              formatDate={(date) => formatDate(date, startDate === endDate ? 'HH:mm' : 'dd-MM-yyyy')}
            />
          }
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
          formatter={(value) => `${value}${formatTotalPeriodCount(periodStatistics, value)}`}
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
