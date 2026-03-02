import React, { useEffect, useRef, useState } from 'react';
import { BarChart, CartesianGrid, YAxis, Tooltip, Legend, Bar, Label, XAxis } from 'recharts';
import {
  chartDataKey,
  dateFormatter,
  formatDate,
  formatTotalPeriodCount,
  getColor,
  getKeys,
  getTicks,
} from '../../util/charts-utils';
import { GroupByPeriod } from '../MetricAndPeriodOptions/types';
import { useTranslation } from 'react-i18next';
import { ChartData } from 'types/chart';
import { usePeriodStatisticsContext } from 'hooks/usePeriodStatisticsContext';
import { CustomChartTooltip } from 'components';

const FEEDBACK_Y_AXIS_MAX = 20;

type Props = {
  data: ChartData;
  startDate: string;
  endDate: string;
  unit?: string;
  groupByPeriod: GroupByPeriod;
  isRatingDistribution?: boolean;
};

const BarGraph: React.FC<Props> = ({ startDate, endDate, data, unit, groupByPeriod, isRatingDistribution }) => {
  const [width, setWidth] = useState<number | null>(null);
  const { periodStatistics } = usePeriodStatisticsContext();

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

  let minDate = new Date(startDate).getTime();
  if (groupByPeriod === 'day') {
    const millisecondInOneDay = 24 * 60 * 60 * 1000;
    minDate = minDate - millisecondInOneDay;
  }

  const domain = [minDate, new Date(endDate).getTime()];
  const ticks = getTicks(startDate, endDate, new Date(startDate), new Date(endDate), 5);

  const ratingTooltip = (props: { payload?: Array<{ payload?: { rating: number | string; count: number } }> }) => {
    const payload = props?.payload ?? [];
    if (!payload.length) return null;
    const p = payload[0]?.payload;
    if (p?.count == null) return null;
    const ratingLabel = p.rating === '-' ? t('feedback.chatsWithNoFeedback') : String(p.rating);
    return (
      <div style={{ padding: 8, background: '#fff', border: '1px solid #ccc' }}>
        {String(t('chart.rating'))}: {ratingLabel} — {String(t('chart.count'))}: {p.count}
      </div>
    );
  };

  if (isRatingDistribution && (data?.chartData?.length ?? 0) > 0 && data.chartData?.[0] && ('rating' in data.chartData[0] || 'displayCount' in data.chartData[0])) {
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
          <YAxis domain={[0, FEEDBACK_Y_AXIS_MAX]} allowDataOverflow>
            <Label dx={-25} angle={270} value={unit ?? String(t('chart.count'))} />
          </YAxis>
          <Tooltip content={ratingTooltip} />
          <Bar
            dataKey="displayCount"
            type="monotone"
            fill={getColor(data, 'displayCount') || '#8884d8'}
            stroke={getColor(data, 'displayCount') || '#8884d8'}
          />
        </BarChart>
      </div>
    );
  }

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
        <XAxis
          dataKey={chartDataKey}
          scale="time"
          tickFormatter={(value) => dateFormatter(startDate, endDate, value)}
          type="number"
          domain={domain}
          ticks={ticks}
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
        <Tooltip content={<CustomChartTooltip formatDate={(date) => formatDate(date, 'dd-MM-yyyy')} />} />
        <Legend
          wrapperStyle={{ position: 'relative', marginTop: '20px' }}
          formatter={(value) => `${value}${formatTotalPeriodCount(periodStatistics, value)}`}
        />
        {data?.chartData?.length > 0 &&
          getKeys(data.chartData).map((k, i) => {
            const isCount = k === t('chats.totalCount');
            const isString = typeof data.chartData[0][k] === 'string';
            return k === chartDataKey ? null : (
              <Bar
                key={k}
                dataKey={k}
                type="monotone"
                barSize={isString ? 0 : undefined}
                height={isString ? 0 : undefined}
                stackId={isCount || isString ? undefined : chartDataKey}
                stroke={getColor(data, k)}
                fill={getColor(data, k)}
                minPointSize={data?.minPointSize ?? undefined}
              />
            );
          })}
      </BarChart>
    </div>
  );
};

export default BarGraph;
