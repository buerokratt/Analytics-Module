import i18n from "../i18n";
import { chartDataKey } from "./charts-utils";

export const calculatePercentagesFromResponse = (response: any): any[] => {
  const totalCountTitle = i18n.t('chats.totalCount');
  const reducedValues: any = {};
  for (const x of response) {
    for (const key in x) {
      if(key !== chartDataKey && key !== totalCountTitle){
        reducedValues[key] = (reducedValues[key] ?? 0) + (x[key] ?? 0);
      }
    }
  }

  const percentages: any[] = [];
  for (const key in reducedValues) {
    const currentPercentage: any = {};
    currentPercentage['name'] = key;
    currentPercentage['value'] = parseFloat(
      (
        (reducedValues[key] /
          Object.values(reducedValues).reduce<number>((a: any, b: any) => a + b, 0)) *
        100
      ).toFixed(1)
    );
    percentages.push(currentPercentage);
  }

  return percentages;
}
