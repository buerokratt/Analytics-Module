import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface PeriodStatisticsContextType {
  periodStatistics: Record<string, number>;
  setPeriodStatistics: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  // todo rename
  updatePeriodStatistics: (chartData: Record<string, number>[] | undefined, unit: string | undefined) => void;
}

const PeriodStatisticsContext = createContext<PeriodStatisticsContextType | undefined>(undefined);

interface PeriodStatisticsProviderProps {
  children: ReactNode;
}

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

export const PeriodStatisticsProvider: React.FC<PeriodStatisticsProviderProps> = ({ children }) => {
  const [periodStatistics, setPeriodStatistics] = useState<Record<string, number>>({});
  const { t } = useTranslation();

  const updatePeriodStatistics = (chartData: Record<string, number>[] | undefined, unit: string | undefined) => {
    if (!chartData?.length) return;
    console.log('chartData CONTEXT', chartData);

    if (unit === t('units.chats')) {
      setPeriodStatistics(getPeriodTotalCounts(chartData));
    } else if (unit === t('units.minutes') || unit === t('units.messages')) {
      setPeriodStatistics(getPeriodAveragesOrMedians(chartData, t('chats.medianWaitingTime')));
    } else if (unit === t('units.nps')) {
      // todo
      // Handle NPS case if needed in the future
      // setPeriodStatistics({ [t('units.nps')]: chartData[chartData.length - 1].NPS });
    }

    console.log('periodStatistics CONTEXT', periodStatistics);
  };

  return (
    <PeriodStatisticsContext.Provider
      value={{
        periodStatistics,
        setPeriodStatistics,
        updatePeriodStatistics,
      }}
    >
      {children}
    </PeriodStatisticsContext.Provider>
  );
};

export const usePeriodStatisticsContext = () => {
  const context = useContext(PeriodStatisticsContext);
  if (context === undefined) {
    throw new Error('usePeriodStatisticsContext must be used within a PeriodStatisticsProvider');
  }
  return context;
};

// // Export the original hook with the same interface for backward compatibility
// export const usePeriodStatistics = (chartData: Record<string, number>[] | undefined, unit: string | undefined) => {
//   const { periodStatistics, updatePeriodStatistics } = usePeriodStatisticsContext();

//   React.useEffect(() => {
//     updatePeriodStatistics(chartData, unit);
//   }, [chartData, unit]);

//   return periodStatistics;
// };
