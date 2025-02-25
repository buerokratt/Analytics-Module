export type ChartType = {
  label: string;
  value: string;
};

export type ChartData = {
  chartData: Record<string, number>[];
  colors: { id: string; color: string }[];
};
