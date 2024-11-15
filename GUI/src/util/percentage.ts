import i18n from '../i18n';
import { chartDataKey } from './charts-utils';

interface PercentageResult {
  name: string;
  value: number;
}

export const calculatePercentagesFromResponse = (response: Record<string, number>[]): PercentageResult[] => {
  console.log('response', response);
  const totalCountTitle = i18n.t('chats.totalCount');
  const reducedValues: Record<string, number> = {};

  for (const x of response) {
    for (const key in x) {
      if (key !== chartDataKey && key !== totalCountTitle) {
        reducedValues[key] = (reducedValues[key] ?? 0) + (x[key] ?? 0);
      }
    }
  }

  console.log('reducedValues', reducedValues);

  const percentages: PercentageResult[] = [];
  const total = Object.values(reducedValues).reduce((a, b) => a + b, 0);

  for (const key in reducedValues) {
    percentages.push({
      name: key,
      value: total === 0 ? 100 : parseFloat(((reducedValues[key] / total) * 100).toFixed(1)),
    });
  }

  return percentages;
};
