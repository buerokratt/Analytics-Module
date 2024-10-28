import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const usePeriodStatistics = (chartData: Record<string, number>[] | undefined, unit: string | undefined) => {
  const [periodStatistics, setPeriodStatistics] = useState<Record<string, number>>({});
  const { t } = useTranslation();

  useEffect(() => {
    if (!chartData?.length) return;

    if (unit === t('units.chats')) setPeriodStatistics(getPeriodTotalCounts(chartData));
    if (unit === t('units.minutes') || unit === t('units.messages')) setPeriodStatistics(getPeriodAverages(chartData));
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

const getPeriodAverages = (chartData: Record<string, number>[]) => {
  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};

  chartData.forEach((entry) => {
    Object.entries(entry).forEach(([key, value]) => {
      if (key !== 'dateTime') {
        sums[key] = (sums[key] ?? 0) + value;
        counts[key] = (counts[key] ?? 0) + 1;
      }
    });
  });

  const averages: Record<string, number> = {};
  Object.keys(sums).forEach((key) => {
    averages[key] = Number((sums[key] / counts[key]).toFixed(2));
  });

  return averages;
};
