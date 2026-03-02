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
  isRatingDistribution?: boolean;
};

const LineGraph = ({ data, startDate, endDate, unit, isRatingDistribution }: Props) => {
  const [width, setWidth] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { periodStatistics } = usePeriodStatisticsContext();
  const { t } = useTranslation();

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

  const ratingTooltip = (props: { payload?: Array<{ payload?: { rating: number; count: number } }> }) => {
    const payload = props?.payload ?? [];
    if (!payload.length) return null;
    const p = payload[0]?.payload;
    if (!p || p.count == null) return null;
    const display = p.count > FEEDBACK_Y_AXIS_MAX ? `${FEEDBACK_Y_AXIS_MAX}+` : String(p.count);
    return (
      <div style={{ padding: 8, background: '#fff', border: '1px solid #ccc' }}>
        {String(t('chart.rating'))}: {p.rating} — {String(t('chart.count'))}: {display}
      </div>
    );
  };

  if (isRatingDistribution && (data?.chartData?.length ?? 0) > 0 && data.chartData?.[0] && 'rating' in data.chartData[0]) {
    return (
      <div ref={ref}>
        <LineChart
          width={width ?? 0}
          height={(width ?? 0) / 3.76}
          data={data.chartData}
          margin={{ top: 20, right: 65, left: 10, bottom: 70 }}
        >
          <Tooltip content={ratingTooltip} />
          <XAxis dataKey="rating" type="category" />
          <YAxis domain={[0, FEEDBACK_Y_AXIS_MAX]} allowDataOverflow>
            <Label dx={-25} angle={270} value={unit ?? String(t('chart.count'))} />
          </YAxis>
          <CartesianGrid stroke="#f5f5f5" />
          <Line
            dataKey="displayCount"
            type="monotone"
            stroke={getColor(data, 'displayCount') || '#8884d8'}
            fill={getColor(data, 'displayCount') || '#8884d8'}
          />
        </LineChart>
      </div>
    );
  }

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
