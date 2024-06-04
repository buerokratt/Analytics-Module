import { t } from 'i18next';
import { SubOption } from '../components/MetricAndPeriodOptions/types';
import { chartDataKey } from './charts-utils';
import { request, Methods } from './axios-client';

export const fetchChartDataWithSubOptions = async (url: string, config: any, subOptions: SubOption[]) => {
  try {
    const result: any = await request({
      url,
      method: Methods.post,
      withCredentials: true,
      data: {
        start_date: config?.start,
        end_date: config?.end,
        period: config?.groupByPeriod ?? 'day',
        options: config?.options.join(',') ?? '',
      },
    });

    const chartData = result.response.reduce((acc: any, row: any, index: number) => {
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

    return { chartData, colors };
  } catch (_) {
    return {};
  }
};

export const fetchChartData = async (url: string, config: any, resultId: string, resultColor = '#fdbf47') => {
  try {
    const result: any = await request({
      url,
      method: Methods.post,
      withCredentials: true,
      data: {
        start_date: config?.start,
        end_date: config?.end,
        period: config?.groupByPeriod ?? 'day',
      },
    });

    const response = result.response.map((entry: any) => {
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
