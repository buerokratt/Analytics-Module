import axios from 'axios';
import { t } from 'i18next';
import { SubOption } from '../components/MetricAndPeriodOptions/types';
import { chartDataKey } from './charts-utils';

export const fetchChartDataWithSubOptions = async (
  url: string,
  config: any,
  subOptions: SubOption[],
  isPercentage?: boolean
) => {
  try {
    const result = await axios.post(url, {
      start_date: config?.start,
      end_date: config?.end,
      period: config?.groupByPeriod ?? 'day',
      options: config?.options.join(',') ?? '',
    });

    const chartData = result.data.response.reduce((acc: any, row: any, index: number) => {
      row.forEach((obj: any) => {
        const { time, ...value } = obj;
        const newObj = {
          [chartDataKey]: new Date(time).getTime(),
          [t(subOptions[index].labelKey)]: value[Object.keys(value)[0]],
        };
        const existingObj = acc.find((item: any) => item[chartDataKey] === newObj[chartDataKey]);
        if (existingObj) Object.assign(existingObj, newObj);
        else acc.push(newObj);
      });
      return acc;
    }, []);

    const colors = subOptions.map((x) => ({ id: t(x.labelKey), color: x.color }));

    if (isPercentage === true) {
      const percentagesResponse = chartData.reduce(function (a: any, b: any) {
        const res: any = {};
        Object.keys(chartData[0]).forEach((e: string) => {
          if (e != chartDataKey) {
            res[e] = a[e] ?? 0 + b[e] ?? 0;
          }
        });
        return res;
      });

      const percentagesData: any[] = [];
      for (const key in percentagesResponse) {
        const currentPercentage: any = {};
        currentPercentage['name'] = key;
        currentPercentage['value'] = parseFloat(
          (
            (percentagesResponse[key] /
              Object.values(percentagesResponse).reduce<number>((a: any, b: any) => a + b, 0)) *
            100
          ).toFixed(1)
        );
        percentagesData.push(currentPercentage);
      }
      return { chartData, percentagesData, colors };
    } else {
      return { chartData, colors };
    }
  } catch (_) {
    return {};
  }
};

export const fetchChartData = async (url: string, config: any, resultId: string, resultColor = '#fdbf47') => {
  try {
    const result = await axios.post(url, {
      start_date: config?.start,
      end_date: config?.end,
      period: config?.groupByPeriod ?? 'day',
    });

    const response = result.data.response.map((entry: any) => {
      const { time, ...value } = entry;

      return {
        [t(resultId)]: value[Object.keys(value)[0]],
        [chartDataKey]: new Date(time).getTime(),
      };
    });

    return {
      chartData: response,
      colors: [{ id: t(resultId), color: resultColor }],
    };
  } catch (_) {
    return {};
  }
};
