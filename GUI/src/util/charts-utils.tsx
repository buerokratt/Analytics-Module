import {
  addDays,
  addHours,
  format,
  isSameDay,
  parseISO,
  startOfDay,
  startOfHour,
} from 'date-fns';
import { t } from 'i18next';
import { ChartData } from 'types/chart';
import { randomColor } from './generateRandomColor';
import { Advisor } from 'types/advisor';

export const dateFormatter = (startDate: string, endDate: string, date: string) => {
  return format(new Date(date), startDate === endDate ? 'HH:mm' : 'dd-MM-yyyy');
};

const MAX_X_AXIS_LABELS = 31;

export const isHourlyPeriod = (groupByPeriod: string | undefined, startDate: string, endDate: string) =>
  groupByPeriod ? groupByPeriod === 'hour' : isSameDay(parseISO(startDate), parseISO(endDate));

export type TimeSeries = {
  readonly rows: Record<string, number | string>[];
  // Indexes of rows added to fill the range, i.e. buckets without data from the API
  readonly emptyIndexes: Set<number>;
};

// Places every row into its local hour/day bucket and fills the whole range with one row per bucket,
// so a category x-axis renders each bar/point exactly above the label of the period it represents.
export const buildTimeSeries = (
  chartData: Record<string, number | string>[],
  startDate: string,
  endDate: string,
  isHourly: boolean
): TimeSeries => {
  const rows = chartData ?? [];
  const toBucket = (value: Date) => (isHourly ? startOfHour(value) : startOfDay(value)).getTime();
  const next = (value: Date) => (isHourly ? addHours(value, 1) : addDays(value, 1));

  const start = startOfDay(parseISO(startDate));
  const end = startOfDay(parseISO(endDate));
  const last = isHourly ? addHours(end, 23).getTime() : end.getTime();
  if (Number.isNaN(start.getTime()) || Number.isNaN(last) || start.getTime() > last) {
    return { rows, emptyIndexes: new Set() };
  }

  const numericKeys = getKeys(rows).filter((k) => k !== chartDataKey && rows.some((row) => typeof row[k] === 'number'));
  const rowsByBucket = new Map<number, Record<string, number | string>>();
  rows.forEach((row) => {
    const bucket = toBucket(new Date(row[chartDataKey]));
    rowsByBucket.set(bucket, { ...rowsByBucket.get(bucket), ...row, [chartDataKey]: bucket });
  });

  const series: Record<string, number | string>[] = [];
  const emptyIndexes = new Set<number>();
  for (let current = start; current.getTime() <= last; current = next(current)) {
    const bucket = current.getTime();
    const row = rowsByBucket.get(bucket);
    if (!row) emptyIndexes.add(series.length);
    const emptyRow = Object.fromEntries(numericKeys.map((k) => [k, 0]));
    series.push({ ...emptyRow, ...row, [chartDataKey]: bucket });
  }
  return { rows: series, emptyIndexes };
};

// Number of labels skipped between shown ones, keeping the x-axis readable on long periods
export const getXAxisInterval = (bucketCount: number) =>
  bucketCount > MAX_X_AXIS_LABELS ? Math.ceil(bucketCount / MAX_X_AXIS_LABELS) - 1 : 0;

const FRACTIONAL_AXIS_STEPS = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5];
const MAX_FRACTIONAL_AXIS_STEPS = 5;

// Y-axis for time series charts. Fractional values below 10 (e.g. averages in minutes) get a finer scale
// instead of the default 0-10 one, so their bars/lines don't look flat.
export const getValueAxis = (maxValue: number, isFractional: boolean): { max: number; ticks: number[] } => {
  if (!isFractional || maxValue >= 10) {
    const max = roundUpToTen(maxValue);
    return { max, ticks: getDistributionYAxisTicks(max) };
  }

  const target = Math.max(maxValue, FRACTIONAL_AXIS_STEPS[0]);
  const step =
    FRACTIONAL_AXIS_STEPS.find((s) => Math.ceil(target / s) <= MAX_FRACTIONAL_AXIS_STEPS) ??
    FRACTIONAL_AXIS_STEPS[FRACTIONAL_AXIS_STEPS.length - 1];
  const stepCount = Math.ceil(target / step);
  const ticks = Array.from({ length: stepCount + 1 }, (_, i) => round(i * step));
  return { max: ticks[ticks.length - 1], ticks };
};

export const hasFractionalValues = (rows: Record<string, number | string>[], keys: string[]) =>
  rows.some((row) => keys.some((k) => typeof row[k] === 'number' && !Number.isInteger(row[k])));

const getReadableAxisStep = (maxValue: number) => {
  const minStep = 10;
  const normalizedMax = Math.max(maxValue, minStep);
  const magnitude = Math.pow(10, Math.max(0, Math.floor(Math.log10(normalizedMax)) - 1));
  const multipliers = [1, 2, 2.5, 5, 10];

  for (const multiplier of multipliers) {
    const step = Math.max(minStep, multiplier * magnitude);
    if (normalizedMax / step <= 6) return step;
  }

  return Math.max(minStep, magnitude * 10);
};

export const roundUpToTen = (value: number): number => (value <= 10 ? 10 : Math.ceil(value / 10) * 10);

export const getDistributionYAxisTicks = (yAxisMax: number) => {
  const normalizedMax = Math.max(yAxisMax, 10);
  const step = getReadableAxisStep(normalizedMax);
  const ticks: number[] = [];

  for (let tick = 0; tick < normalizedMax; tick += step) ticks.push(tick);

  if (ticks[ticks.length - 1] !== normalizedMax) ticks.push(normalizedMax);

  return ticks;
};

export const formatDate = (value: Date, dateFormat?: string) => format(value, dateFormat ?? 'dd-MM-yyyy');

export const formatTimestamp = (timestamp: string) => formatDate(new Date(timestamp), 'dd.MM.yyyy');

export const getColor = (data: ChartData, key: string) => data.colors.find((e: any) => e.id == key)?.color ?? '#FFB511';

export const translateChartKeys = (obj: any, key: string) =>
  Object.keys(obj).reduce(
    (acc, k) =>
      k === key
        ? acc
        : {
            ...acc,
            ...{ [t(`chart.${k}`)]: obj[k] },
          },
    {}
  );

export const chartDateFormat = 'yyyy-MM-dd';

export const chartDataKey = 'dateTime';

export const round = (value: any) => Math.round(Number(value) * 100) / 100;

export const getKeys = (data: any[]) => Array.from(new Set(data.flatMap((obj: any) => Object.keys(obj))));

export const formatTotalPeriodCount = (totalPeriodCounts: Record<string, number>, metric: string) => {
  // !== undefined to support 0 values
  const count = totalPeriodCounts[metric];
  return count !== undefined ? ` (${count})` : '';
};

export const getAdvisorsList = (response: any): Advisor[] => {
  const advisorsList = Array.from(new Set(response.map((advisor: any) => advisor.customerSupportId)))
    .map((id: any) => response.find((e: any) => e.customerSupportId == id))
    .map((e) => {
      return {
        id: e?.customerSupportId ?? '',
        labelKey: e?.customerSupportFullName ?? '',
        color: randomColor(),
        isSelected: true,
      };
    });

  return advisorsList;
};

export const getAdvisorChartData = (response: any, advisors: Advisor[], mappingKey: string) => {
  const data = response
    .flat(1)
    .map((entry: any) => ({
      ...translateChartKeys(entry, chartDataKey),
      [chartDataKey]: new Date(entry[chartDataKey]).getTime(),
    }))
    .reduce((a: any, b: any) => {
      const dateRow = a.find((i: any) => i[chartDataKey] === b[chartDataKey]);
      if (dateRow) {
        dateRow[b[t('chart.customerSupportFullName')]] = b[t(mappingKey)];
      } else {
        a.push({
          [chartDataKey]: b[chartDataKey],
          [b[t('chart.customerSupportFullName')]]: b[t(mappingKey)],
        });
      }
      return a;
    }, [])
    .map((e: any) => {
      const res = { ...e };
      advisors.forEach((i) => {
        if (!(i.labelKey in e)) {
          res[i.labelKey] = 0;
        }
      });
      return res;
    })
    .sort((a: Record<string, number | string>, b: Record<string, number | string>) => Number(a[chartDataKey]) - Number(b[chartDataKey]));

  return data;
};
