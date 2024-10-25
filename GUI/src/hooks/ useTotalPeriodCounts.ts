import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useTotalPeriodCounts = (chartData: Record<string, number>[] | undefined, unit: string | undefined) => {
  const [totalPeriodCounts, setTotalPeriodCounts] = useState<Record<string, number>>({});
  const { t } = useTranslation();

  useEffect(() => {
    if (!chartData?.length || unit !== t('units.chats')) return;

    setTotalPeriodCounts(getPeriodTotalCounts(chartData));
  }, [chartData, unit, t]);

  return totalPeriodCounts;
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
