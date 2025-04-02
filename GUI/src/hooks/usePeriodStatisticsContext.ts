import { PeriodStatisticsContext } from 'components/context/PeriodStatisticsContext';
import { useContext } from 'react';

export const usePeriodStatisticsContext = () => {
  const context = useContext(PeriodStatisticsContext);
  if (context === undefined) {
    throw new Error('usePeriodStatisticsContext must be used within a PeriodStatisticsProvider');
  }
  return context;
};
