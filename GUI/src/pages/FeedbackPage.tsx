import { useTranslation } from 'react-i18next';
import React, { useEffect, useRef, useState } from 'react';
import OptionsPanel, { Option } from '../components/MetricAndPeriodOptions';
import MetricsCharts from '../components/MetricsCharts';
import ChatsTable from '../components/ChatsTable';
import {
  getAverageFeedbackOnBuerokrattChats,
  getNpsFeedbackOnBuerokrattChats,
  getChatsStatuses,
  getDistributionOnCSAChatsFeedback,
  getNegativeFeedbackChats,
  getNpsOnCSAChatsFeedback,
  getNpsOnSelectedCSAChatsFeedback,
  getDistributionOnBuerokrattChatsFeedback,
} from '../resources/api-constants';
import { MetricOptionsState } from '../components/MetricAndPeriodOptions/types';
import { Chat } from '../types/chat';
import { chartDataKey, formatDate, translateChartKeys } from '../util/charts-utils';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { request, Methods } from '../util/axios-client';
import withAuthorization, { ROLES } from '../hoc/with-authorization';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { analyticsApi } from '../components/services/api';
import useStore from '../store/user/store';
import { useMutation } from '@tanstack/react-query';
import { randomColor } from 'util/generateRandomColor';
import { ChartData } from 'types/chart';
import { usePeriodStatisticsContext } from 'hooks/usePeriodStatisticsContext';

const FeedbackPage: React.FC = () => {
  const { t } = useTranslation();
  const [chartData, setChartData] = useState<ChartData>({
    chartData: [],
    colors: [],
  });
  const [negativeFeedbackChats, setNegativeFeedbackChats] = useState<Chat[] | undefined>(undefined);
  const advisors = useRef<any[]>([]);
  const userInfo = useStore((state) => state.userInfo);
  const [advisorsList, setAdvisorsList] = useState<any[]>([]);
  const [currentMetric, setCurrentMetric] = useState('feedback.statuses');
  const [currentConfigs, setCurrentConfigs] = useState<MetricOptionsState>();
  const [unit, setUnit] = useState('');
  const [showSelectAll, setShowSelectAll] = useState<boolean>(false);
  const { setPeriodStatistics } = usePeriodStatisticsContext();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    setAdvisorsList(advisors.current);
  }, [advisorsList]);

  useEffect(() => {
    setPeriodStatistics(chartData.feedBackData ? { ...chartData.feedBackData } : chartData, unit);
  }, [chartData, unit]);

  const fetchData = async () => {
    try {
      const response = await analyticsApi.get('/accounts/get-page-preference', {
        params: { user_id: userInfo?.idCode, page_name: window.location.pathname },
      });
      if (response.data.pageResults !== undefined) {
        return updatePagePreference(response.data.pageResults);
      } else {
        return undefined;
      }
    } catch (err) {
      console.error('Failed to fetch data');
    }
  };

  const updatePagePreference = (pageResults: number): PaginationState => {
    const updatedPagination: PaginationState = { ...pagination, pageSize: pageResults };
    setPagination(updatedPagination);
    return updatedPagination;
  };

  const updatePageSize = useMutation({
    mutationFn: (data: { page_results: number }) => {
      return analyticsApi.post('accounts/update-page-preference', {
        user_id: userInfo?.idCode,
        page_name: window.location.pathname,
        page_results: data.page_results,
      });
    },
  });

  // todo chat count in history is 97, in analytics 81
  // todo extra statuses seen in test: user-reached, accepted (many events), user-not-reached

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
        {
          id: 'contact-information-skipped',
          labelKey: 'feedback.status_options.contact-information-skipped',
          color: randomColor(),
          isSelected: true,
        },
      ],
      unit: t('units.chats') ?? 'chats',
    },
    {
      id: 'burokratt_chats',
      labelKey: 'feedback.burokratt_chats',
      unit: t('units.nps') ?? 'nps',
      subRadioOptions: [
        {
          id: 'NPS',
          labelKey: 'feedback.status_options.nps',
          color: randomColor(),
        },
        {
          id: 'AVG',
          labelKey: 'feedback.status_options.average',
          color: randomColor(),
        },
      ],
    },
    {
      id: 'advisor_chats',
      labelKey: 'feedback.advisor_chats',
      unit: t('units.nps') ?? 'nps',
    },
    {
      id: 'selected_advisor_chats',
      labelKey: 'feedback.selected_advisor_chats',
      unit: t('units.nps') ?? 'nps',
    },
    {
      id: 'negative_feedback',
      labelKey: 'feedback.negative_feedback',
      unit: t('units.feedback') ?? 'feedback',
    },
  ]);

  const showNegativeChart = negativeFeedbackChats != undefined && currentConfigs?.metric === 'negative_feedback';

  const [configsSubject] = useState(() => new Subject());
  useEffect(() => {
    const subscription = configsSubject
      .pipe(
        distinctUntilChanged(),
        debounceTime(300),
        switchMap(async (config: any) => {
          switch (config.metric) {
            case 'statuses':
              return fetchChatsStatuses(config);
            case 'burokratt_chats': {
              const promises = [
                fetchDistributionOnBuerokrattChatsFeedback(config),
                config.options === 'AVG'
                  ? fetchAverageFeedbackOnBuerokrattChats(config)
                  : fetchNpsFeedbackOnBuerokrattChats(config),
              ];
              const [distributionData, feedBackData] = await Promise.all(promises);
              return { distributionData, feedBackData };
            }
            case 'advisor_chats': {
              const [distributionData, feedBackData] = await Promise.all([
                fetchDistributionOnCSAChatsFeedback(config),
                fetchNpsOnCSAChatsFeedback(config),
              ]);
              return { distributionData, feedBackData };
            }
            case 'selected_advisor_chats':
              return fetchNpsOnSelectedCSAChatsFeedback(config);
            case 'negative_feedback':
              return fetchData().then((res) => {
                if (res) {
                  return fetchChatsWithNegativeFeedback(config, res.pageIndex + 1, res.pageSize, 'created desc');
                } else {
                  return fetchChatsWithNegativeFeedback(config);
                }
              });
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
    setShowSelectAll(false);
    let chartData = {};
    const events =
      config?.options.filter(
        (e) =>
          e === 'CLIENT_LEFT_WITH_ACCEPTED' ||
          e === 'CLIENT_LEFT_WITH_NO_RESOLUTION' ||
          e === 'CLIENT_LEFT_FOR_UNKNOWN_REASONS' ||
          e === 'contact-information-skipped'
      ) ?? [];
    const csa_events =
      config?.options.filter(
        (e) =>
          e !== 'CLIENT_LEFT_WITH_ACCEPTED' &&
          e !== 'CLIENT_LEFT_WITH_NO_RESOLUTION' &&
          e !== 'CLIENT_LEFT_FOR_UNKNOWN_REASONS'
      ) ?? [];
    try {
      const result: any = await request({
        url: getChatsStatuses(),
        method: Methods.post,
        withCredentials: true,
        data: {
          metric: config?.groupByPeriod ?? 'day',
          start_date: config?.start,
          end_date: config?.end,
          events: events?.length > 0 ? events : null,
          csa_events: csa_events?.length > 0 ? csa_events : null,
        },
      });

      const response = result.response
        .flat(1)
        .map((entry: any) => ({
          ...translateChartKeys(entry, chartDataKey),
          [chartDataKey]: new Date(entry[chartDataKey]).getTime(),
        }))
        .reduce((a: any, b: any) => {
          const dateRow = a.find((i: any) => i[chartDataKey] === b[chartDataKey]);
          if (dateRow) {
            dateRow[t(`feedback.plain_status_options.${b[t('chart.event')].toLowerCase()}`)] = b[t('chart.count')];
          } else {
            a.push({
              [chartDataKey]: b[chartDataKey],
              [t(`feedback.plain_status_options.${b[t('chart.event')].toLowerCase()}`)]: b[t('chart.count')],
            });
          }
          return a;
        }, []);

      chartData = {
        chartData: response,
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
    setShowSelectAll(false);
    let chartData = {};
    try {
      const { response } = await fetchAndMapFeedbackData(getAverageFeedbackOnBuerokrattChats, config);

      chartData = {
        chartData: response,
        colors: [{ id: 'average', color: '#FFB511' }],
        minPointSize: 3,
      };
      setUnit(t('units.minutes') ?? 'chats');
    } catch (_) {
      //error
    }
    return chartData;
  };

  const fetchNpsFeedbackOnBuerokrattChats = async (config: any) => {
    setShowSelectAll(false);
    let chartData = {};
    try {
      const { result, response } = await fetchAndMapFeedbackData(getNpsFeedbackOnBuerokrattChats, config);

      chartData = {
        chartData: response,
        colors: [{ id: 'NPS', color: '#FFB511' }],
        periodNps: result.periodNps,
      };
    } catch (_) {
      //error
    }
    return chartData;
  };

  const fetchDistributionOnBuerokrattChatsFeedback = async (config: any) => {
    setShowSelectAll(false);
    let chartData = {};
    try {
      const result: any = await request({
        url: getDistributionOnBuerokrattChatsFeedback(),
        method: Methods.post,
        withCredentials: true,
        data: {
          start_date: config?.start,
          end_date: config?.end,
        },
      });

      chartData = mapDistributionChartData(result);
    } catch (e) {
      console.error(e);
    }
    return chartData;
  };

  const fetchNpsOnCSAChatsFeedback = async (config: any) => {
    setShowSelectAll(false);
    let chartData = {};
    try {
      const { result, response } = await fetchAndMapFeedbackData(getNpsOnCSAChatsFeedback, config);

      chartData = {
        chartData: response,
        colors: [{ id: 'NPS', color: '#FFB511' }],
        periodNps: result.periodNps,
      };
    } catch (_) {
      //error
    }
    return chartData;
  };

  const fetchDistributionOnCSAChatsFeedback = async (config: any) => {
    setShowSelectAll(false);
    let chartData = {};
    try {
      const result: any = await request({
        url: getDistributionOnCSAChatsFeedback(),
        method: Methods.post,
        withCredentials: true,
        data: {
          start_date: config?.start,
          end_date: config?.end,
        },
      });

      chartData = mapDistributionChartData(result);
    } catch (e) {
      console.error(e);
    }
    return chartData;
  };

  const fetchNpsOnSelectedCSAChatsFeedback = async (config: any) => {
    setShowSelectAll(true);
    let chartData = {};
    try {
      const excluded_csas = advisors.current.map((e) => e.id).filter((e) => !config?.options.includes(e));
      const result: any = await request({
        url: getNpsOnSelectedCSAChatsFeedback(),
        method: Methods.post,
        withCredentials: true,
        data: {
          metric: config?.groupByPeriod ?? 'day',
          start_date: config?.start,
          end_date: config?.end,
          excluded_csas: (excluded_csas.length ?? 0) > 0 ? excluded_csas : [''],
        },
      });

      const res = result.response;

      const advisorsList = Array.from(new Set(res.map((advisor: any) => advisor.customerSupportId)))
        .map((id: any) => res.find((e: any) => e.customerSupportId == id))
        .map((e) => {
          return {
            id: e?.customerSupportId ?? '',
            labelKey: e?.customerSupportFullName ?? '',
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
            dateRow[b[t('chart.customerSupportFullName')]] = b[t('chart.nps')];
          } else {
            a.push({
              [chartDataKey]: b[chartDataKey],
              [b[t('chart.customerSupportFullName')]]: b[t('chart.nps')],
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

      chartData = {
        chartData: chartResponse,
        colors: feedbackMetrics[3].subOptions!.map(({ labelKey, color }) => {
          return {
            id: labelKey,
            color,
          };
        }),
        periodNpsByCsa: result.periodNpsByCsa,
      };
    } catch (_) {
      //error
    }
    return chartData;
  };

  const fetchChatsWithNegativeFeedback = async (
    config: any,
    page: number = pagination.pageIndex + 1,
    pageSize: number = pagination.pageSize,
    sorting: string = 'created desc'
  ) => {
    setShowSelectAll(false);
    let chartData = {};
    try {
      const result: any = await request({
        url: getNegativeFeedbackChats(),
        method: Methods.post,
        withCredentials: true,
        data: {
          start_date: config?.start,
          end_date: config?.end,
          page: page,
          page_size: pageSize,
          sorting: sorting,
        },
      });

      const response = result.response.map((entry: any) => ({
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

      setNegativeFeedbackChats(result.response);
    } catch (_) {
      //error
    }
    return chartData;
  };

  const fetchAndMapFeedbackData = async (
    urlFunction: () => string,
    config: { groupByPeriod?: string; start?: string; end?: string }
  ) => {
    const result: any = await request({
      url: urlFunction(),
      method: Methods.post,
      withCredentials: true,
      data: {
        metric: config?.groupByPeriod ?? 'day',
        start_date: config?.start,
        end_date: config?.end,
      },
    });

    const response = result.response.map((entry: any) => ({
      ...translateChartKeys(entry, chartDataKey),
      [chartDataKey]: new Date(entry[chartDataKey]).getTime(),
    }));

    return { result, response };
  };

  const mapDistributionChartData = (result: any) => {
    const { promoters, passives, detractors } = result.response[0];
    return {
      chartData:
        promoters === 0 && passives === 0 && detractors === 0
          ? []
          : [
              { [t('chart.promoters')]: promoters },
              { [t('chart.passives')]: passives },
              { [t('chart.detractors')]: detractors },
            ],
      colors: [
        { id: t('chart.promoters'), color: '#FF0000' },
        { id: t('chart.passives'), color: '#0000FF' },
        { id: t('chart.detractors'), color: '#00FF00' },
      ],
    };
  };

  return (
    <>
      <h1>{t('menu.feedback')}</h1>
      <OptionsPanel
        metricOptions={feedbackMetrics}
        enableSelectAll={showSelectAll}
        dateFormat="yyyy-MM-dd"
        onChange={(config) => {
          setCurrentConfigs(config);
          configsSubject.next(config);
          setCurrentMetric(`feedback.${config.metric}`);

          const selectedOption = feedbackMetrics.find((x) => x.id === config.metric);
          if (!selectedOption) return;
          setUnit(selectedOption.unit ?? '');
        }}
      />
      {currentConfigs?.metric != 'negative_feedback' && (
        <MetricsCharts
          title={currentMetric}
          data={chartData}
          startDate={currentConfigs?.start ?? formatDate(new Date(), 'yyyy-MM-dd')}
          endDate={currentConfigs?.end ?? formatDate(new Date(), 'yyyy-MM-dd')}
          groupByPeriod={currentConfigs?.groupByPeriod ?? 'day'}
          unit={unit}
        />
      )}
      {showNegativeChart &&
        (negativeFeedbackChats.length > 0 ? (
          <ChatsTable
            dataSource={negativeFeedbackChats}
            pagination={pagination}
            sorting={sorting}
            startDate={currentConfigs?.start}
            endDate={currentConfigs?.end}
            setPagination={(state: PaginationState) => {
              if (state.pageIndex === pagination.pageIndex && state.pageSize === pagination.pageSize) return;
              setPagination(state);
              updatePageSize.mutate({ page_results: state.pageSize });
              const sort =
                sorting.length === 0 ? 'created desc' : sorting[0].id + ' ' + (sorting[0].desc ? 'desc' : 'asc');
              fetchChatsWithNegativeFeedback(currentConfigs, state.pageIndex + 1, state.pageSize, sort);
            }}
            setSorting={(state: SortingState) => {
              setSorting(state);
              const sorting =
                state.length === 0 ? 'created desc' : state[0].id + ' ' + (state[0].desc ? 'desc' : 'asc');
              fetchChatsWithNegativeFeedback(currentConfigs, pagination.pageIndex + 1, pagination.pageSize, sorting);
            }}
          />
        ) : (
          <label style={{ alignSelf: 'center', marginTop: '30px' }}>{t('feedback.no_negative_feedback_chats')}</label>
        ))}
    </>
  );
};

export default withAuthorization(FeedbackPage, [ROLES.ROLE_ADMINISTRATOR, ROLES.ROLE_ANALYST]);
