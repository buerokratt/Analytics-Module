import React, { useEffect, useRef, useState } from 'react';
import { BarChart, CartesianGrid, YAxis, Tooltip, Bar, XAxis, LabelList, ReferenceLine } from 'recharts';
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
  round,
} from '../../util/charts-utils';
import { OVERVIEW_AXIS_STROKE, OVERVIEW_TICK_FILL } from '../../util/overview-colors';
import { createStackedBarShape } from '../../util/stackedBarShape';
import { GroupByPeriod } from '../MetricAndPeriodOptions/types';
import { useTranslation } from 'react-i18next';
import { ChartData } from 'types/chart';
import { MinPointSize } from 'recharts/types/util/BarUtils';
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

  const isHourly = isHourlyPeriod(groupByPeriod, startDate, endDate);
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

  const { rows: chartData, emptyIndexes } = buildTimeSeries(data?.chartData ?? [], startDate, endDate, isHourly);
  const isDenseXAxis = chartData.length > 10;
  const dataKeys = data?.chartData?.length > 0 ? getKeys(data.chartData).filter((k) => k !== chartDataKey) : [];
  const isStringKey = (k: string) => data.chartData.some((row) => typeof row[k] === 'string');
  const stackedKeys = data.disableStacking
    ? []
    : dataKeys.filter((k) => k !== t('chats.totalCount') && !isStringKey(k));
  const topStackedKey = stackedKeys[stackedKeys.length - 1];
  const unstackedKeys = dataKeys.filter((k) => !stackedKeys.includes(k));
  const totalKey = t('chats.totalCount');
  const stackedSumEqualsTotal =
    dataKeys.includes(totalKey) &&
    stackedKeys.length > 0 &&
    data.chartData.every(
      (row) => stackedKeys.reduce((sum, k) => sum + (Number(row[k]) || 0), 0) === (Number(row[totalKey]) || 0)
    );

  const barExtents = chartData.map((row) => {
    const stackedSum = stackedKeys.reduce((sum, k) => sum + (Number(row[k]) || 0), 0);
    const unstackedValues = unstackedKeys.map((k) => Number(row[k]) || 0);
    return [stackedSum, ...unstackedValues];
  });
  const maxTotal = Math.max(0, ...barExtents.flat());
  const minTotal = Math.min(0, ...barExtents.flat());
  const isFractional = hasFractionalValues(chartData, dataKeys);
  const { min: yAxisMin, max: yAxisMax, ticks: yAxisTicks } = getValueAxis(maxTotal, isFractional, minTotal);

  const configuredMinPointSize = data?.minPointSize;
  const minPointSize: MinPointSize | undefined =
    configuredMinPointSize === undefined
      ? undefined
      : (value, index) => {
          if (emptyIndexes.has(index)) return 0;
          return typeof configuredMinPointSize === 'function'
            ? configuredMinPointSize(value, index)
            : configuredMinPointSize;
        };

  return (
    <div ref={ref}>
      <BarChart
        width={width ?? 0}
        height={(width ?? 0) / 3.76}
        data={chartData}
        maxBarSize={20}
        margin={{ top: 20, right: 30, bottom: isDenseXAxis ? 50 : 30 }}
      >
        <CartesianGrid vertical={false} stroke={OVERVIEW_AXIS_STROKE} strokeDasharray="3 3" />
        <XAxis
          dataKey={chartDataKey}
          tickFormatter={(value) => formatDate(new Date(value), isHourly ? 'HH:mm' : 'dd.MM')}
          type="category"
          interval={getXAxisInterval(chartData.length)}
          angle={isDenseXAxis ? 35 : undefined}
          textAnchor={isDenseXAxis ? 'start' : 'middle'}
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
        {yAxisMin < 0 && <ReferenceLine y={0} stroke={OVERVIEW_TICK_FILL} />}
        <Tooltip
          cursor={{ fill: 'rgba(151, 153, 164, 0.12)' }}
          content={<CustomChartTooltip formatDate={(date) => formatDate(date, isHourly ? 'dd-MM-yyyy HH:mm' : 'dd-MM-yyyy')} />}
        />
        {data?.chartData?.length > 0 &&
          dataKeys.map((k) => {
            const isString = isStringKey(k);
            const isStacked = stackedKeys.includes(k);
            const showValueLabel = !isString && !isStacked && (!data.disableStacking || !isDenseXAxis);
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
                minPointSize={minPointSize}
                shape={isStacked ? createStackedBarShape(stackedKeys, k) : undefined}
                radius={!isStacked && !isString ? [4, 4, 0, 0] : undefined}
              >
                {isStacked && k === topStackedKey && !stackedSumEqualsTotal && (
                  <LabelList
                    content={({ x, y, width: barWidth, height: barHeight, index }) => {
                      if (index === undefined) return null;
                      const row = chartData[index as number];
                      if (!row) return null;
                      const total = stackedKeys.reduce((sum, key) => sum + (Number(row[key]) || 0), 0);
                      if (total === 0) return null;
                      const centerX = Number(x) + Number(barWidth) / 2;
                      const labelY = Number(barHeight) < 0 ? Number(y) + 16 : Number(y) - 6;
                      return (
                        <text x={centerX} y={labelY} textAnchor="middle" fontSize={12} fontWeight={600}>
                          {round(total)}
                        </text>
                      );
                    }}
                  />
                )}
                {showValueLabel && (
                  <LabelList
                    dataKey={k}
                    position="top"
                    fill="#000"
                    fontSize={12}
                    fontWeight={600}
                    formatter={(value: number) => (Number(value) !== 0 ? round(value) : '')}
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
