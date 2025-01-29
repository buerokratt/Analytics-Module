import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const usePeriodStatistics = (chartData: Record<string, number>[] | undefined, unit: string | undefined) => {
  const [periodStatistics, setPeriodStatistics] = useState<Record<string, number>>({});
  const { t } = useTranslation();

  useEffect(() => {
    if (!chartData?.length) return;

    if (unit === t('units.chats')) {
      setPeriodStatistics(getPeriodTotalCounts(chartData));
    } else if (unit === t('units.minutes') || unit === t('units.messages')) {
      setPeriodStatistics(getPeriodAveragesOrMedians(chartData, t('chats.medianWaitingTime')));
    }
  }, [chartData, unit, t]);

  return periodStatistics;
};

const getPeriodTotalCounts = (chartData: Record<string, number>[]) => {
  const totals: Record<string, number> = {};

  chartData.forEach((entry) => {
    Object.entries(entry).forEach(([key, value]) => {
      if (key !== 'dateTime') totals[key] = (totals[key] ?? 0) + value;
    });
  });

  return totals;
};

const getPeriodAveragesOrMedians = (chartData: Record<string, number>[], medianKey: string) => {
  const result: Record<string, number> = {};
  const valuesByKey: Record<string, number[]> = {};

  // Collect all values for each key
  chartData.forEach((entry) => {
    Object.entries(entry).forEach(([key, value]) => {
      if (key !== 'dateTime') {
        if (!valuesByKey[key]) valuesByKey[key] = [];
        valuesByKey[key].push(value);
      }
    });
  });

  Object.entries(valuesByKey).forEach(([key, values]) => {
    if (key.includes(medianKey)) {
      result[key] = calculateMedian(values);
    } else {
      result[key] = Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2));
    }
  });

  return result;
};

const calculateMedian = (numbers: number[]): number => {
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return Number(((sorted[middle - 1] + sorted[middle]) / 2).toFixed(2));
  }
  return Number(sorted[middle].toFixed(2));
};
