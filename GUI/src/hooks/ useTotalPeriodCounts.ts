import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getPeriodTotalCounts } from '../util/charts-utils';

export const useTotalPeriodCounts = (chartData: any[], unit: string | undefined) => {
  const [totalPeriodCounts, setTotalPeriodCounts] = useState<Record<string, number>>({});
  const { t } = useTranslation();

  useEffect(() => {
    console.log('HOOK unit', unit);
    if (unit !== t('units.chats')) return;

    setTotalPeriodCounts(getPeriodTotalCounts(chartData));
  }, [chartData, unit, t]);

  return totalPeriodCounts;
};
