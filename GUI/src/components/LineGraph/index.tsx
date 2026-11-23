import React, { useEffect, useRef, useState } from 'react';
import { LineChart, XAxis, Line, CartesianGrid, YAxis, Tooltip, ReferenceLine } from 'recharts';
import {
  buildTimeSeries,
  chartDataKey,
  formatDate,
  getColor,
  getDistributionYAxisTicks,
  getKeys,
  getValueAxis,
  getXAxisInterval,
  hasFractionalValues,
  isHourlyPeriod,
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

  const isHourly = isHourlyPeriod(groupByPeriod, startDate, endDate);
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

  const { rows: chartData } = buildTimeSeries(data?.chartData ?? [], startDate, endDate, isHourly);
  const isDenseXAxis = chartData.length > 10;
  const dataKeys = data?.chartData?.length > 0 ? getKeys(data.chartData).filter((k) => k !== chartDataKey) : [];
  const values = chartData.flatMap((row) => dataKeys.map((k) => Number(row[k]) || 0));
  const maxValue = Math.max(0, ...values);
  const minValue = Math.min(0, ...values);
  const isFractional = hasFractionalValues(chartData, dataKeys);
  const { min: yAxisMin, max: yAxisMax, ticks: yAxisTicks } = getValueAxis(maxValue, isFractional, minValue);

  return (
    <div ref={ref}>
      <LineChart
        width={width ?? 0}
        height={(width ?? 0) / 3.76}
        data={chartData}
        margin={{ top: 20, right: 30, left: 10, bottom: isDenseXAxis ? 50 : 30 }}
      >
        <CartesianGrid vertical={false} stroke={OVERVIEW_AXIS_STROKE} strokeDasharray="3 3" />
        {yAxisMin < 0 && <ReferenceLine y={0} stroke={OVERVIEW_TICK_FILL} />}
        <Tooltip
          cursor={{ stroke: OVERVIEW_AXIS_STROKE }}
          content={
            <CustomChartTooltip
              formatDate={(date) => formatDate(date, isHourly ? 'dd-MM-yyyy HH:mm' : 'dd-MM-yyyy')}
            />
          }
        />
        <XAxis
          dataKey={chartDataKey}
          tickFormatter={(value) => formatDate(new Date(value), isHourly ? 'HH:mm' : 'dd.MM')}
          type="category"
          interval={getXAxisInterval(chartData.length)}
          angle={isDenseXAxis ? 35 : undefined}
          textAnchor={isDenseXAxis ? 'start' : 'middle'}
          padding={{ left: 20, right: 20 }}
          axisLine={{ stroke: OVERVIEW_AXIS_STROKE }}
          tickLine={false}
          tick={{ fill: OVERVIEW_TICK_FILL, fontSize: 12 }}
        />
        <YAxis
          domain={[yAxisMin, yAxisMax]}
          ticks={[...yAxisTicks]}
          allowDecimals={isFractional}
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
