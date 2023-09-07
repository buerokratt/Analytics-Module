import { useTranslation } from 'react-i18next';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import OptionsPanel, { Option } from '../components/MetricAndPeriodOptions';
import MetricsCharts from '../components/MetricsCharts';
import ChatsTable from '../components/ChatsTable';
import {
  getAverageFeedbackOnBuerokrattChats,
  getChatsStatuses,
  getNegativeFeedbackChats,
  getNpsOnCSAChatsFeedback,
  getNpsOnSelectedCSAChatsFeedback,
} from '../resources/api-constants';
import { MetricOptionsState } from '../components/MetricAndPeriodOptions/types';
import { Chat } from '../types/chat';
import { chartDataKey, formatDate, translateChartKeys } from '../util/charts-utils';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

const FeedbackPage: React.FC = () => {
  const [chartData, setChartData] = useState({});
  const [negativeFeedbackChats, setNegativeFeedbackChats] = useState<Chat[]>([]);
  const advisors = useRef<any[]>([]);
  const [advisorsList, setAdvisorsList] = useState<any[]>([]);
  const [currentMetric, setCurrentMetric] = useState('feedback.statuses');
  const randomColor = () => '#' + ((Math.random() * 0xffffff) << 0).toString(16);
  const [currentConfigs, setConfigs] = useState<MetricOptionsState>();
  const [unit, setUnit] = useState('');

  useEffect(() => {
    setAdvisorsList(advisors.current);
  }, [advisorsList]);

  const [feedbackMetrics, setFeedbackMetrics] = useState<Option[]>([
    {
      id: 'statuses',
      labelKey: 'feedback.statuses',
      subOptions: [
        {
          id: 'CLIENT_LEFT_WITH_ACCEPTED',
          labelKey: 'feedback.status_options.client_left_with_accepted',
          color: randomColor(),
          isSelected: true,
        },
        {
          id: 'CLIENT_LEFT_WITH_NO_RESOLUTION',
          labelKey: 'feedback.status_options.client_left_with_no_resolution',
          color: randomColor(),
          isSelected: true,
        },
        {
          id: 'CLIENT_LEFT_FOR_UNKNOWN_REASONS',
          labelKey: 'feedback.status_options.client_left_for_unknown_reasons',
          color: randomColor(),
          isSelected: true,
        },
        {
          id: 'ACCEPTED',
          labelKey: 'feedback.status_options.accepted',
          color: randomColor(),
          isSelected: true,
        },
        {
          id: 'HATE_SPEECH',
          labelKey: 'feedback.status_options.hate_speech',
          color: randomColor(),
          isSelected: true,
        },
        {
          id: 'OTHER',
          labelKey: 'feedback.status_options.other',
          color: randomColor(),
          isSelected: true,
        },
        {
          id: 'RESPONSE_SENT_TO_CLIENT_EMAIL',
          labelKey: 'feedback.status_options.response_sent_to_client_email',
          color: randomColor(),
          isSelected: true,
        },
      ],
      unit: 'chats',
    },
    {
      id: 'burokratt_chats',
      labelKey: 'feedback.burokratt_chats',
      unit: 'chats',
    },
    {
      id: 'advisor_chats',
      labelKey: 'feedback.advisor_chats',
      unit: 'chats',
    },
    {
      id: 'selected_advisor_chats',
      labelKey: 'feedback.selected_advisor_chats',
      unit: 'chats',
    },
    {
      id: 'negative_feedback',
      labelKey: 'feedback.negative_feedback',
      unit: 'feedback',
    },
  ]);

  const { t } = useTranslation();

  const showNegativeChart = negativeFeedbackChats.length > 0 && currentConfigs?.metric === 'negative_feedback';

  const [configsSubject] = useState(() => new Subject());
  useEffect(() => {
    const subscription = configsSubject
      .pipe(
        distinctUntilChanged(),
        debounceTime(300),
        switchMap((config: any) => {
          switch (config.metric) {
            case 'statuses':
              return fetchChatsStatuses(config);
            case 'burokratt_chats':
              return fetchAverageFeedbackOnBuerokrattChats(config);
            case 'advisor_chats':
              return fetchNpsOnCSAChatsFeedback(config);
            case 'selected_advisor_chats':
              return fetchNpsOnSelectedCSAChatsFeedback(config);
            case 'negative_feedback':
              return fetchChatsWithNegativeFeedback(config);
            default:
              return fetchChatsStatuses(config);
          }
        })
      )
      .subscribe((chartData: any) => setChartData(chartData));

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchChatsStatuses = async (config: MetricOptionsState) => {
    let chartData = {};
    const events =
      config?.options.filter(
        (e) =>
          e === 'CLIENT_LEFT_WITH_ACCEPTED' ||
          e === 'CLIENT_LEFT_WITH_NO_RESOLUTION' ||
          e === 'CLIENT_LEFT_FOR_UNKNOWN_REASONS'
      ) ?? [];
    const csa_events =
      config?.options.filter(
        (e) =>
          e !== 'CLIENT_LEFT_WITH_ACCEPTED' &&
          e !== 'CLIENT_LEFT_WITH_NO_RESOLUTION' &&
          e !== 'CLIENT_LEFT_FOR_UNKNOWN_REASONS'
      ) ?? [];
    try {
      const result = await axios.post(getChatsStatuses(), {
        metric: config?.groupByPeriod ?? 'day',
        start_date: config?.start,
        end_date: config?.end,
        events: events?.length > 0 ? events : null,
        csa_events: csa_events?.length > 0 ? csa_events : null,
      });

      const response = result.data.response
        .flat(1)
        .map((entry: any) => ({
          ...translateChartKeys(entry, chartDataKey),
          [chartDataKey]: new Date(entry[chartDataKey]).getTime(),
        }))
        .reduce((a: any, b: any) => {
          const dateRow = a.find((i: any) => i[chartDataKey] === b[chartDataKey]);
          if (dateRow) {
            dateRow[t(`feedback.plain_status_options.${b['Event'].toLowerCase()}`)] = t(b['Count']);
          } else {
            a.push({
              [chartDataKey]: b[chartDataKey],
              [t(`feedback.plain_status_options.${b['Event'].toLowerCase()}`)]: t(b['Count']),
            });
          }
          return a;
        }, []);

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
        colors: feedbackMetrics[0].subOptions!.map(({ id, color }) => {
          return {
            id: t(`feedback.plain_status_options.${id.toLowerCase()}`),
            color,
          };
        }),
      };
    } catch (_) {
      //error
    }
    return chartData;
  };

  const fetchAverageFeedbackOnBuerokrattChats = async (config: any) => {
    let chartData = {};
    try {
      const result = await axios.post(getAverageFeedbackOnBuerokrattChats(), {
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
        colors: [{ id: 'average', color: '#FFB511' }],
      };
    } catch (_) {
      //error
    }
    return chartData;
  };

  const fetchNpsOnCSAChatsFeedback = async (config: any) => {
    let chartData = {};
    try {
      const result = await axios.post(getNpsOnCSAChatsFeedback(), {
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
        colors: [{ id: 'Nps', color: '#FFB511' }],
      };
    } catch (_) {
      //error
    }
    return chartData;
  };

  const fetchNpsOnSelectedCSAChatsFeedback = async (config: any) => {
    let chartData = {};
    try {
      const excluded_csas = advisors.current.map((e) => e.id).filter((e) => !config?.options.includes(e));
      const result = await axios.post(getNpsOnSelectedCSAChatsFeedback(), {
        metric: config?.groupByPeriod ?? 'day',
        start_date: config?.start,
        end_date: config?.end,
        excluded_csas: excluded_csas.length ?? 0 > 0 ? excluded_csas : [''],
      });

      const res = result.data.response;

      const advisorsList = Array.from(new Set(res.map((advisor: any) => advisor.customerSupportId)))
        .map((id: any) => res.find((e: any) => e.customerSupportId == id))
        .map((e) => {
          return {
            id: e?.customerSupportId ?? '',
            labelKey: e?.customerSupportDisplayName ?? '',
            color: randomColor(),
            isSelected: true,
          };
        });

      if (advisorsList.length > advisors.current.length) {
        const updatedMetrics = [...feedbackMetrics];
        updatedMetrics[3].subOptions = advisorsList;
        advisors.current = advisorsList;
        setFeedbackMetrics(updatedMetrics);
        setAdvisorsList(advisors.current);
      } else if (advisors.current.length === 0) {
        const updatedMetrics = [...feedbackMetrics];
        updatedMetrics[3].subOptions = [];
        advisors.current = [];
        setFeedbackMetrics(updatedMetrics);
        setAdvisorsList([]);
      }

      const response = res
        .flat(1)
        .map((entry: any) => ({
          ...translateChartKeys(entry, chartDataKey),
          [chartDataKey]: new Date(entry[chartDataKey]).getTime(),
        }))
        .reduce((a: any, b: any) => {
          const dateRow = a.find((i: any) => i[chartDataKey] === b[chartDataKey]);
          if (dateRow) {
            dateRow[b['Customer Support Display Name']] = b['Nps'];
          } else {
            a.push({
              [chartDataKey]: b[chartDataKey],
              [b['Customer Support Display Name']]: b['Nps'],
            });
          }
          return a;
        }, []);

      const chartResponse = response.map((e: any) => {
        const res = { ...e };
        advisorsList.forEach((i) => {
          if (!(i.labelKey in e)) {
            res[i.labelKey] = 0;
          }
        });
        return res;
      });

      const percentagesResponse = chartResponse.reduce(function (a: any, b: any) {
        const res: any = {};
        Object.keys(chartResponse[0]).forEach((e: string) => {
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
        chartData: chartResponse,
        percentagesData: percentages,
        colors: feedbackMetrics[3].subOptions!.map(({ labelKey, color }) => {
          return {
            id: labelKey,
            color,
          };
        }),
      };
    } catch (_) {
      //error
    }
    return chartData;
  };

  const fetchChatsWithNegativeFeedback = async (config: any) => {
    let chartData = {};
    try {
      const result = await axios.post(
        getNegativeFeedbackChats(),
        {
          events: '',
          start_date: config?.start,
          end_date: config?.end,
        },
        { withCredentials: true }
      );

      const response = result.data.response.map((entry: any) => ({
        ...translateChartKeys(entry, 'created'),
        [chartDataKey]: new Date(entry.created).getTime(),
      }));

      chartData = {
        chartData: response,
        colors: [
          { id: chartDataKey, color: '#FFB511' },
          { id: 'Ended', color: '#FFB511' },
        ],
      };
      setNegativeFeedbackChats(result.data.response);
    } catch (_) {
      //error
    }
    return chartData;
  };

  return (
    <>
      <h1>{t('menu.feedback')}</h1>
      <OptionsPanel
        metricOptions={feedbackMetrics}
        dateFormat="yyyy-MM-dd"
        onChange={(config) => {
          setConfigs(config);
          configsSubject.next(config);
          setCurrentMetric(`feedback.${config.metric}`);

          const selectedOption = feedbackMetrics.find((x) => x.id === config.metric);
          if (!selectedOption) return;
          setUnit(selectedOption.unit ?? '');
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
      {showNegativeChart && <ChatsTable dataSource={negativeFeedbackChats} />}
    </>
  );
};

export default FeedbackPage;
