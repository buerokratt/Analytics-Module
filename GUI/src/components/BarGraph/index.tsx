import React, { useEffect, useRef, useState } from 'react';
import { BarChart, XAxis, CartesianGrid, YAxis, Tooltip, Legend, Bar, Label, ResponsiveContainer } from 'recharts';
import { chartDataKey, dateFormatter, formatDate, getColor, getTicks, round } from '../../util/charts-utils';
import { GroupByPeriod } from '../MetricAndPeriodOptions/types';
import { useTranslation } from 'react-i18next';

type Props = {
  data: any;
  startDate: string;
  endDate: string;
  unit?: string;
  groupByPeriod: GroupByPeriod;
};

const BarGraph: React.FC<Props> = ({ startDate, endDate, data, unit, groupByPeriod }) => {
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

  let minDate = new Date(startDate).getTime();
  if (groupByPeriod === 'day') {
    const millisecondInOneDay = 24 * 60 * 60 * 1000;
    minDate = minDate - millisecondInOneDay;
  }

  const domain = [minDate, new Date(endDate).getTime()];
  const ticks = getTicks(startDate, endDate, new Date(startDate), new Date(endDate), 5);

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
        <Tooltip
          labelFormatter={(value) => {
            if (typeof value === 'number') {
              return formatDate(new Date(value), 'dd-MM-yyyy');
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
        <Legend wrapperStyle={{ position: 'relative', marginTop: '20px' }} />
        {(data?.chartData?.length > 0 ?? false) &&
          Object.keys(data.chartData[0]).map((k, i) => {
            const isCount = k === t('chats.totalCount');
            return k === chartDataKey ? null : (
              <Bar
                key={k}
                dataKey={k}
                type="monotone"
                barSize={isCount ? 0 : undefined}
                height={isCount ? 0 : undefined}
                legendType={isCount ? 'none' : undefined}
                stackId={isCount ? undefined : chartDataKey}
                stroke={getColor(data, k)}
                fill={getColor(data, k)}
              />
            );
          })}
        <Tooltip />
      </BarChart>
    </div>
  );
};

export default BarGraph;
