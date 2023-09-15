import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import OptionsPanel, { Option } from '../components/MetricAndPeriodOptions';
import MetricsCharts from '../components/MetricsCharts';
import { MetricOptionsState } from '../components/MetricAndPeriodOptions/types';
import { chartDataKey, formatDate, translateChartKeys } from '../util/charts-utils';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {
  getAvgCsaPresent,
  getAvgPickTime,
  getChatForwards,
  getCsaAvgChatTime,
  getCsaChatsTotal,
} from '../resources/api-constants';

const AdvisorsPage: React.FC = () => {
  const { t } = useTranslation();
  const [chartData, setChartData] = useState({});
  const [currentMetric, setCurrentMetric] = useState('');
  const [currentConfigs, setConfigs] = useState<MetricOptionsState>();
  const [unit, setUnit] = useState('');

  const advisorsMetrics = [
    {
      id: 'chat_forwards',
      labelKey: 'advisors.chat_forwards',
      subOptions: [
        { id: 'receivedChats', labelKey: 'advisors.forwards.from_csa', color: '#FFB511' },
        { id: 'forwardedChats', labelKey: 'advisors.forwards.to_csa', color: '#ED7D31' },
        { id: 'forwardedExternally', labelKey: 'advisors.forwards.to_other', color: '#8BB4D5' },
      ],
      unit: t('units.chats') ?? 'chats',
    },
    {
      id: 'avg_pick_time',
      labelKey: 'advisors.avg_pick_time',
      unit: t('units.seconds') ?? 'seconds',
    },
    {
      id: 'avg_present_csa',
      labelKey: 'advisors.avg_present_csa',
      unit: t('units.counselors') ?? 'counselors',
    },
    {
      id: 'num_chats_csa',
      labelKey: 'advisors.num_chats_csa',
      unit: t('units.chats') ?? 'chats',
    },
    {
      id: 'avg_chat_time_csa',
      labelKey: 'advisors.avg_chat_time_csa',
      unit: t('units.seconds') ?? 'seconds',
    },
  ];

  const [configsSubject] = useState(() => new Subject());
  useEffect(() => {
    const subscription = configsSubject
      .pipe(
        distinctUntilChanged(),
        debounceTime(300),
        switchMap((config: any) => {
          switch (config.metric) {
            case 'chat_forwards':
              return fetchChatsForwards(config);
            case 'avg_pick_time':
              return fetchAverageChatPickUpTime(config);
            case 'avg_present_csa':
              return fetchAveragePresentCsas(config);
            case 'num_chats_csa':
              return fetchTotalCsaChats(config);
            case 'avg_chat_time_csa':
              return fetchAverageCsaChatTime(config);
            default:
              return fetchChatsForwards(config);
          }
        })
      )
      .subscribe((chartData: any) => setChartData(chartData));

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchChatsForwards = async (config: any) => {
    let chartData = {};
    try {
      const result = await axios.post(getChatForwards(), {
        metric: config?.groupByPeriod ?? 'day',
        start_date: config?.start,
        end_date: config?.end,
      });

      const res = result.data.response.map((entry: any) => ({
        ...translateChartKeys(entry, chartDataKey),
        [chartDataKey]: new Date(entry[chartDataKey]).getTime(),
      }));

      const requiredKeys = [chartDataKey, ...config.options];

      const response = res.map((item: any) => {
        const returnValue: any = {};
        requiredKeys.forEach((key: string) =>
          key != chartDataKey
            ? (returnValue[t(`chart.${key}`)] = item[t(`chart.${key}`)])
            : (returnValue[key] = item[key])
        );
        return returnValue;
      });

      const percentagesResponse = response.reduce(function (a: any, b: any) {
        const res: any = {};
        Object.keys(response[0]).forEach((e: string) => {
          if (e != 'dateTime') {
            res[e] = a[e] + b[e];
          }
        });
        return res;
      });

      const percentages: any[] = [];
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
        percentages.push(currentPercentage);
      }

      chartData = {
        chartData: response,
        percentagesData: percentages,
        colors: advisorsMetrics[0].subOptions!.map(({ id, color }) => {
          return {
            id: t(`chart.${id}`),
            color,
          };
        }),
      };
      console.log(chartData);
    } catch (_) {
      //error
    }
    return chartData;
  };

  const fetchAverageChatPickUpTime = async (config: any) => {
    let chartData = {};
    try {
      const result = await axios.post(getAvgPickTime(), {
        metric: config?.groupByPeriod ?? 'day',
        start_date: config?.start,
        end_date: config?.end,
      });

      const response = result.data.response.map((entry: any) => ({
        ...translateChartKeys(entry, chartDataKey),
        [chartDataKey]: new Date(entry[chartDataKey]).getTime(),
      }));

      chartData = {
        chartData: response,
        colors: [{ id: 'Average (Min)', color: '#FFB511' }],
      };
    } catch (_) {
      //error
    }
    return chartData;
  };

  const fetchAveragePresentCsas = async (config: any) => {
    let chartData = {};
    try {
      const result = await axios.post(getAvgCsaPresent(), {
        metric: config?.groupByPeriod ?? 'day',
        start_date: config?.start,
        end_date: config?.end,
      });

      const response = result.data.response.map((entry: any) => ({
        ...translateChartKeys(entry, chartDataKey),
        [chartDataKey]: new Date(entry[chartDataKey]).getTime(),
      }));

      chartData = {
        chartData: response,
        colors: [{ id: 'Average', color: '#FFB511' }],
      };
    } catch (_) {
      //error
    }
    return chartData;
  };

  const fetchTotalCsaChats = async (config: any) => {
    let chartData = {};
    try {
      const result = await axios.post(getCsaChatsTotal(), {
        metric: config?.groupByPeriod ?? 'day',
        start_date: config?.start,
        end_date: config?.end,
      });

      const response = result.data.response.map((entry: any) => ({
        ...translateChartKeys(entry, chartDataKey),
        [chartDataKey]: new Date(entry[chartDataKey]).getTime(),
      }));

      chartData = {
        chartData: response,
        colors: [{ id: 'count', color: '#FFB511' }],
      };
    } catch (_) {
      //error
    }
    return chartData;
  };

  const fetchAverageCsaChatTime = async (config: any) => {
    let chartData = {};
    try {
      const result = await axios.post(getCsaAvgChatTime(), {
        metric: config?.groupByPeriod ?? 'day',
        start_date: config?.start,
        end_date: config?.end,
      });

      const response = result.data.response.map((entry: any) => ({
        ...translateChartKeys(entry, chartDataKey),
        [chartDataKey]: new Date(entry[chartDataKey]).getTime(),
      }));

      chartData = {
        chartData: response,
        colors: [{ id: 'Average (Min)', color: '#FFB511' }],
      };
    } catch (_) {
      //error
    }
    return chartData;
  };

  return (
    <>
      <h1>{t('menu.advisors')}</h1>
      <OptionsPanel
        metricOptions={advisorsMetrics}
        dateFormat="yyyy-MM-dd"
        onChange={(config) => {
          setConfigs(config);
          configsSubject.next(config);
          setCurrentMetric(`advisors.${config.metric}`);
          const selectedOption = advisorsMetrics.find((x) => x.id === config.metric);
          if (!selectedOption) return;
          setUnit(selectedOption.unit);
        }}
      />
      <MetricsCharts
        title={currentMetric}
        data={chartData}
        startDate={currentConfigs?.start ?? formatDate(new Date(), 'yyyy-MM-dd')}
        endDate={currentConfigs?.end ?? formatDate(new Date(), 'yyyy-MM-dd')}
        groupByPeriod={currentConfigs?.groupByPeriod ?? 'day'}
        unit={unit}
      />
    </>
  );
};

export default AdvisorsPage;
