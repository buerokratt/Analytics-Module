import { MinPointSize } from 'recharts/types/util/BarUtils';

export type ChartType = {
  label: string;
  value: string;
};

export type ChartData = {
  chartData: Record<string, number>[];
  colors: { id: string; color: string }[];
  minPointSize?: MinPointSize;
  periodNps?: number;
  periodNpsByCsa?: Record<string, number>;
  distributionData?: ChartData;
  feedBackData?: ChartData;
};
