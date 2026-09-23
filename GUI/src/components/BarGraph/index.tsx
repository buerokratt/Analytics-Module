import React, { useEffect, useRef, useState } from 'react';
import { BarChart, CartesianGrid, YAxis, Tooltip, Bar, XAxis, LabelList } from 'recharts';
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
import { createStackedBarShape } from '../../util/stackedBarShape';
import { GroupByPeriod } from '../MetricAndPeriodOptions/types';
import { useTranslation } from 'react-i18next';
import { ChartData } from 'types/chart';
import { CustomChartTooltip, RatingDistributionTooltip } from 'components';

type Props = {
  data: ChartData;
  startDate: string;
  endDate: string;
  unit?: string;
  groupByPeriod: GroupByPeriod;
  isRatingDistribution?: boolean;
};

const BarGraph: React.FC<Props> = ({ startDate, endDate, data, groupByPeriod, isRatingDistribution }) => {
  const [width, setWidth] = useState<number | null>(null);

  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleResize = () => {
      setWidth(ref.current?.clientWidth ?? 0);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isHourly = groupByPeriod === 'hour';
  const domain = [new Date(startDate).getTime(), new Date(endDate).getTime()];
  const xAxisTicks = getTicks(startDate, endDate, new Date(startDate), new Date(endDate), 5);
  const isDenseXAxis = xAxisTicks.length > 10;
  const ratingDistributionTicks = getDistributionYAxisTicks(data.yAxisMax ?? 10);

  if (isRatingDistribution && (data?.chartData?.length ?? 0) > 0 && data.chartData?.[0] && 'rating' in data.chartData[0]) {
    return (
      <div ref={ref}>
        <BarChart
          width={width ?? 0}
          height={(width ?? 0) / 3.76}
          data={data.chartData}
          barSize={20}
          margin={{ top: 20, right: 65, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="rating" type="category" />
          <YAxis domain={[0, data.yAxisMax ?? 10]} ticks={ratingDistributionTicks} allowDataOverflow allowDecimals={false} />
          <Tooltip content={<RatingDistributionTooltip />} />
          <Bar
            dataKey="count"
            type="monotone"
            fill={getColor(data, 'count') || '#8884d8'}
            stroke={getColor(data, 'count') || '#8884d8'}
          >
            <LabelList
              dataKey="count"
              position="top"
              formatter={(value: number) => (value > 0 ? value : '')}
            />
          </Bar>
        </BarChart>
      </div>
    );
  }

  const dataKeys = data?.chartData?.length > 0 ? getKeys(data.chartData).filter((k) => k !== chartDataKey) : [];
  const stackedKeys = dataKeys.filter((k) => {
    const isCount = k === t('chats.totalCount');
    const isString = typeof data.chartData[0][k] === 'string';
    return !isCount && !isString;
  });
  const topStackedKey = stackedKeys[stackedKeys.length - 1];
  const unstackedKeys = dataKeys.filter((k) => !stackedKeys.includes(k));

  const maxTotal = Math.max(
    0,
    ...(data.chartData ?? []).map((row) => {
      const stackedSum = stackedKeys.reduce((sum, k) => sum + (Number(row[k]) || 0), 0);
      const unstackedMax = unstackedKeys.reduce((max, k) => Math.max(max, Number(row[k]) || 0), 0);
      return Math.max(stackedSum, unstackedMax);
    })
  );
  const yAxisMax = roundUpToTen(maxTotal);
  const yAxisTicks = getDistributionYAxisTicks(yAxisMax);

  return (
    <div ref={ref}>
      <BarChart
        width={width ?? 0}
        height={(width ?? 0) / 3.76}
        data={data.chartData}
        barSize={20}
        margin={{ top: 20, right: 30, bottom: isDenseXAxis ? 50 : 30 }}
      >
        <CartesianGrid vertical={false} stroke={OVERVIEW_AXIS_STROKE} strokeDasharray="3 3" />
        <XAxis
          dataKey={chartDataKey}
          tickFormatter={(value) => formatDate(new Date(value), isHourly ? 'HH:mm' : 'dd.MM')}
          type="number"
          domain={domain}
          ticks={xAxisTicks}
          scale="time"
          minTickGap={0}
          interval={0}
          angle={isDenseXAxis ? 35 : undefined}
          dy={isDenseXAxis ? 26 : undefined}
          padding={{ left: 25, right: isHourly ? 8 : 14 }}
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
        <Tooltip
          cursor={{ fill: 'rgba(151, 153, 164, 0.12)' }}
          content={<CustomChartTooltip formatDate={(date) => formatDate(date, 'dd-MM-yyyy')} />}
        />
        {data?.chartData?.length > 0 &&
          dataKeys.map((k) => {
            const isCount = k === t('chats.totalCount');
            const isString = typeof data.chartData[0][k] === 'string';
            const isStacked = !isCount && !isString;
            return (
              <Bar
                key={k}
                dataKey={k}
                type="monotone"
                barSize={isString ? 0 : undefined}
                height={isString ? 0 : undefined}
                stackId={isStacked ? chartDataKey : undefined}
                stroke={getColor(data, k)}
                fill={getColor(data, k)}
                minPointSize={data?.minPointSize ?? undefined}
                shape={isStacked ? createStackedBarShape(stackedKeys, k) : undefined}
                radius={!isStacked && !isString ? [4, 4, 0, 0] : undefined}
              >
                {isStacked && k === topStackedKey && stackedKeys.length > 0 && (
                  <LabelList
                    content={({ x, y, width: barWidth, index }) => {
                      if (index === undefined) return null;
                      const row = data.chartData[index as number];
                      if (!row) return null;
                      const total = stackedKeys.reduce((sum, key) => sum + (Number(row[key]) || 0), 0);
                      if (total <= 0) return null;
                      const centerX = Number(x) + Number(barWidth) / 2;
                      return (
                        <text x={centerX} y={Number(y) - 6} textAnchor="middle" fontSize={12} fontWeight={600}>
                          {total}
                        </text>
                      );
                    }}
                  />
                )}
              </Bar>
            );
          })}
      </BarChart>
    </div>
  );
};

export default BarGraph;
