import React, { useEffect, useRef, useState } from 'react';
import { LineChart, XAxis, Line, CartesianGrid, YAxis, Tooltip } from 'recharts';
import {
  chartDataKey,
  formatDate,
  getColor,
  getDistributionYAxisTicks,
  getKeys,
  getTicks,
  roundUpToTen,
} from '../../util/charts-utils';
import { OVERVIEW_AXIS_STROKE, OVERVIEW_TICK_FILL } from '../../util/overview-colors';
import { GroupByPeriod } from '../MetricAndPeriodOptions/types';
import { ChartData } from 'types/chart';
import { CustomChartTooltip, RatingDistributionTooltip } from 'components';

type Props = {
  data: ChartData;
  startDate: string;
  endDate: string;
  unit?: string;
  groupByPeriod?: GroupByPeriod;
  isRatingDistribution?: boolean;
};

const LineGraph = ({ data, startDate, endDate, groupByPeriod, isRatingDistribution }: Props) => {
  const [width, setWidth] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setWidth(ref.current?.clientWidth ?? 0);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isHourly = groupByPeriod ? groupByPeriod === 'hour' : startDate === endDate;
  const domain = [new Date(startDate).getTime(), new Date(endDate).getTime()];
  const xAxisTicks = getTicks(startDate, endDate, new Date(startDate), new Date(endDate), 5);
  const isDenseXAxis = xAxisTicks.length > 10;
  const ratingDistributionTicks = getDistributionYAxisTicks(data.yAxisMax ?? 10);

  if (isRatingDistribution && (data?.chartData?.length ?? 0) > 0 && data.chartData?.[0] && 'rating' in data.chartData[0]) {
    return (
      <div ref={ref}>
        <LineChart
          width={width ?? 0}
          height={(width ?? 0) / 3.76}
          data={data.chartData}
          margin={{ top: 20, right: 65, left: 10, bottom: 70 }}
        >
          <Tooltip content={<RatingDistributionTooltip />} />
          <XAxis dataKey="rating" type="category" />
          <YAxis domain={[0, data.yAxisMax ?? 10]} ticks={ratingDistributionTicks} allowDataOverflow allowDecimals={false} />
          <CartesianGrid stroke="#f5f5f5" />
          <Line
            dataKey="count"
            type="monotone"
            stroke={getColor(data, 'count') || '#8884d8'}
            fill={getColor(data, 'count') || '#8884d8'}
          />
        </LineChart>
      </div>
    );
  }

  const dataKeys = data?.chartData?.length > 0 ? getKeys(data.chartData).filter((k) => k !== chartDataKey) : [];
  const maxValue = Math.max(
    0,
    ...(data.chartData ?? []).flatMap((row) => dataKeys.map((k) => Number(row[k]) || 0))
  );
  const yAxisMax = roundUpToTen(maxValue);
  const yAxisTicks = getDistributionYAxisTicks(yAxisMax);

  return (
    <div ref={ref}>
      <LineChart
        width={width ?? 0}
        height={(width ?? 0) / 3.76}
        data={data.chartData}
        margin={{ top: 20, right: 30, left: 10, bottom: isDenseXAxis ? 50 : 30 }}
      >
        <CartesianGrid vertical={false} stroke={OVERVIEW_AXIS_STROKE} strokeDasharray="3 3" />
        <Tooltip
          cursor={{ stroke: OVERVIEW_AXIS_STROKE }}
          content={
            <CustomChartTooltip
              formatDate={(date) => formatDate(date, startDate === endDate ? 'HH:mm' : 'dd-MM-yyyy')}
            />
          }
        />
        <XAxis
          dataKey={chartDataKey}
          tickFormatter={(value) => formatDate(new Date(value), isHourly ? 'HH:mm' : 'dd.MM')}
          domain={domain}
          ticks={xAxisTicks}
          scale="time"
          type="number"
          allowDuplicatedCategory={false}
          minTickGap={0}
          interval={0}
          angle={isDenseXAxis ? 35 : undefined}
          dx={isDenseXAxis ? 30 : undefined}
          dy={isDenseXAxis ? 26 : undefined}
          padding={{ left: isHourly ? 8 : 14, right: isHourly ? 8 : 14 }}
          axisLine={{ stroke: OVERVIEW_AXIS_STROKE }}
          tickLine={false}
          tick={{ fill: OVERVIEW_TICK_FILL, fontSize: 12 }}
        />
        <YAxis
          domain={[0, yAxisMax]}
          ticks={yAxisTicks}
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          tick={{ fill: OVERVIEW_TICK_FILL, fontSize: 12 }}
        />
        {dataKeys.map((k) => (
          <Line
            key={k}
            dataKey={k}
            type="monotone"
            strokeWidth={2}
            stroke={getColor(data, k)}
            fill={getColor(data, k)}
            dot={{ r: 4, strokeWidth: 0, fill: getColor(data, k) }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </div>
  );
};

export default LineGraph;
