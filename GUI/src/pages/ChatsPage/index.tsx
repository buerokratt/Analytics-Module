import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import OptionsPanel from '../../components/MetricAndPeriodOptions';
import { MetricOptionsState } from '../../components/MetricAndPeriodOptions/types';
import MetricsCharts from '../../components/MetricsCharts';
import { chartDateFormat, formatDate } from '../../util/charts-utils';
import { fetchData } from './data';
import { chatOptions } from './options';
import withAuthorization, { ROLES } from '../../hoc/with-authorization';
import { ChartData } from 'types/chart';
import { usePeriodStatisticsContext } from 'components/context/PeriodStatisticsContext';

const ChatsPage: React.FC = () => {
  const { t } = useTranslation();
  const [tableTitleKey, setTableTitleKey] = useState(chatOptions[0].labelKey);
  const [unit, setUnit] = useState(chatOptions[0].unit);
  const [configs, setConfigs] = useState<MetricOptionsState>();
  const [chartData, setChartData] = useState<ChartData>({
    chartData: [],
    colors: [],
  });
  const { updatePeriodStatistics } = usePeriodStatisticsContext();

  useEffect(() => {
    updatePeriodStatistics(chartData.chartData, unit);
  }, [chartData, unit]);

  const [configsSubject] = useState(() => new Subject());
  useEffect(() => {
    const subscription = configsSubject
      .pipe(distinctUntilChanged(), debounceTime(500), switchMap(fetchData))
      .subscribe((data: any) => data && setChartData(data));

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <h1>{t('menu.chats')}</h1>
      <OptionsPanel
        metricOptions={chatOptions}
        dateFormat={chartDateFormat}
        onChange={(config) => {
          setConfigs(config);
          configsSubject.next(config);
          const selectedOption = chatOptions.find((x) => x.id === config.metric);
          if (!selectedOption) return;
          setTableTitleKey(selectedOption.labelKey);
          setUnit(selectedOption.unit);
        }}
      />
      <MetricsCharts
        title={tableTitleKey}
        data={chartData}
        startDate={configs?.start ?? formatDate(new Date(), chartDateFormat)}
        endDate={configs?.end ?? formatDate(new Date(), chartDateFormat)}
        unit={unit}
        groupByPeriod={configs?.groupByPeriod ?? 'day'}
      />
    </>
  );
};

export default withAuthorization(ChatsPage, [ROLES.ROLE_ADMINISTRATOR, ROLES.ROLE_ANALYST]);
