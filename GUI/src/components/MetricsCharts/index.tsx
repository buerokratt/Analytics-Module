import { Trans, useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { MdOutlineDownload, MdOutlineInfo } from 'react-icons/md';
import Tooltip from '../Tooltip';
import { Button, Card, FormSelect, Icon } from '../../components';
import BarGraph from '../BarGraph';
import './MetricsCharts.scss';
import LineGraph from '../LineGraph';
import PieGraph from '../PieGraph';
import { getXlsx } from '../../resources/api-constants';
import { ChartData, ChartType, ChartViewType } from '../../types/chart';
import { chartDataKey, formatDate, formatTimestamp, formatTotalPeriodCount, getColor, getKeys } from '../../util/charts-utils';
import { formatOverviewDate } from '../../util/overview-date-utils';
import { GroupByPeriod } from '../MetricAndPeriodOptions/types';
import { request, Methods } from '../../util/axios-client';
import { saveFile } from 'util/file';
import { usePeriodStatisticsContext } from 'hooks/usePeriodStatisticsContext';

type Props = {
  title: string;
  data: ChartData;
  startDate: string;
  endDate: string;
  unit?: string;
  groupByPeriod: GroupByPeriod;
  readonly defaultChartType?: ChartViewType;
};

const formatPeriodScore = (value: number | undefined | null): string => {
  if (value == null || Number.isNaN(value)) return '—';
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : '—';
};

const getCountForRatings = (chartData: { rating: number; count: number }[], ratings: number[]): number =>
  chartData.filter(({ rating }) => ratings.includes(rating)).reduce((s, { count }) => s + count, 0);

const calcPct = (numerator: number, denominator: number): string => {
  if (!denominator) return '—';
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
};

const calcPeriodScore = (
  satisfiedCount: number,
  dissatisfiedCount: number,
  totalFeedback: number,
  isFiveScale: boolean,
): number | null => {
  if (totalFeedback <= 0) return null;
  if (isFiveScale) return (satisfiedCount / totalFeedback) * 100;
  return ((satisfiedCount - dissatisfiedCount) / totalFeedback) * 100;
};

const MetricsCharts = ({ title, data, startDate, endDate, unit, groupByPeriod, defaultChartType }: Props) => {
  const { t } = useTranslation();
  const { periodStatistics } = usePeriodStatisticsContext();
  const formattedStartDate = formatDate(new Date(startDate), 'yyyy-MM-dd');
  const formattedEndDate = formatDate(new Date(endDate), 'yyyy-MM-dd');
  const isFiveScale = data.distributionData?.isFiveScale ?? false;
  const feedbackScoreLabel = isFiveScale ? t('feedback.positiveFeedbackScore') : t('feedback.averageNps');

  const distributionChartData = (data.distributionData?.chartData ?? []) as { rating: number; count: number }[];
  const totalFeedback = data.distributionData?.totalFeedback ?? 0;

  const averageFeedbackRating =
    totalFeedback > 0
      ? (distributionChartData.reduce((sum, { rating, count }) => sum + rating * count, 0) / totalFeedback).toFixed(2)
      : '—';

  const satisfiedCount = isFiveScale
    ? getCountForRatings(distributionChartData, [5])
    : getCountForRatings(distributionChartData, [9, 10]);
  const passiveCount = isFiveScale
    ? getCountForRatings(distributionChartData, [4])
    : getCountForRatings(distributionChartData, [7, 8]);
  const dissatisfiedCount = isFiveScale
    ? getCountForRatings(distributionChartData, [1, 2, 3])
    : getCountForRatings(distributionChartData, [0, 1, 2, 3, 4, 5, 6]);

  const satisfiedPct = calcPct(satisfiedCount, totalFeedback);
  const passivePct = calcPct(passiveCount, totalFeedback);
  const dissatisfiedPct = calcPct(dissatisfiedCount, totalFeedback);

  const periodScore = calcPeriodScore(satisfiedCount, dissatisfiedCount, totalFeedback, isFiveScale);

  const charts: ChartType[] = [
    {
      label: t('chart.barChart'),
      value: 'barChart',
    },
    {
      label: t('chart.pieChart'),
      value: 'pieChart',
    },
    {
      label: t('chart.lineChart'),
      value: 'lineChart',
    },
  ];
  const [selectedChart, setSelectedChart] = useState<string>(defaultChartType ?? 'barChart');
  const isRatingDistribution = data.distributionData?.isRatingDistribution === true;

  useEffect(() => {
    setSelectedChart(defaultChartType ?? 'barChart');
  }, [defaultChartType]);
  const distributionOrFeedBack = selectedChart === 'pieChart' ? (data.distributionData ?? data) : (data.feedBackData ?? data);
  const selectedData = isRatingDistribution ? (data.distributionData ?? data) : distributionOrFeedBack;

  const showHeaderLegend = selectedChart !== 'pieChart' && !isRatingDistribution;
  const legendKeys =
    showHeaderLegend && (selectedData?.chartData?.length ?? 0) > 0
      ? getKeys(selectedData.chartData).filter((k) => k !== chartDataKey)
      : [];

  const buildChart = () => {
    if (selectedChart === 'pieChart') {
      return <PieGraph data={selectedData} isRatingDistribution={isRatingDistribution} />;
    } else if (selectedChart === 'lineChart') {
      return (
        <LineGraph
          data={selectedData}
          startDate={formattedStartDate}
          endDate={formattedEndDate}
          unit={unit}
          groupByPeriod={groupByPeriod}
          isRatingDistribution={isRatingDistribution}
        />
      );
    } else {
      return (
        <BarGraph
          data={selectedData}
          startDate={formattedStartDate}
          endDate={formattedEndDate}
          unit={unit}
          groupByPeriod={groupByPeriod}
          isRatingDistribution={isRatingDistribution}
        />
      );
    }
  };

  const downloadXlsx = async (data: any[] = []) => {
    const modifiedData: any[] = data?.map((item) => {
      const modifiedItem: any = { ...item };
      getKeys(data).forEach((propertyName: any) => {
        if (!(propertyName in modifiedItem)) {
          modifiedItem[propertyName] = 0;
        }
      });
      return modifiedItem;
    });

    const res = await request<
      {
        data: unknown[];
      },
      {
        base64String: string;
      }
    >({
      url: getXlsx(),
      method: Methods.post,
      withCredentials: true,
      data: {
        data: modifiedData?.map((p) => {
          const { [chartDataKey]: originalKey, ...rest } = p;
          return originalKey === undefined
            ? rest
            : {
                [t(`global.${chartDataKey}`)]: formatTimestamp(originalKey),
                ...rest,
              };
        }),
      },
    });

    await saveFile(
      res.base64String,
      'metrics.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
  };

  return (
    <Card>
      <div className="metrics_header">
        <div className="metrics_header__top">
          <h3 className="metrics_header__title">
            {t(title)}{' '}
            {t('general.periodRange', {
              start: formatOverviewDate(new Date(startDate)),
              end: formatOverviewDate(new Date(endDate)),
            })}
          </h3>
          {legendKeys.length > 0 && (
            <div className="metrics_header__legend">
              {legendKeys.map((key) => (
                <div key={key} className="metrics_header__legend-item">
                  <span className="metrics_header__legend-icon" style={{ backgroundColor: getColor(data, key) }} />
                  <span className="metrics_header__legend-label">
                    {key}
                    {formatTotalPeriodCount(periodStatistics, key)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="metrics_header__actions">
          <Button
            appearance="secondary"
            style={{ boxShadow: 'inset 0 0 0 2px #005AA3', color: '#005AA3' }}
            onClick={() => {
              let sourceData = data.chartData;
              if (data.distributionData?.isRatingDistribution) {
                sourceData = data.distributionData?.chartData ?? data.chartData;
              } else if (data.feedBackData?.chartData) {
                sourceData = data.feedBackData.chartData;
              }
              downloadXlsx(sourceData);
            }}
          >
            <Icon
              icon={<MdOutlineDownload />}
              size="small"
            />
            {t('reports.download_xlsx')}
          </Button>
          <div className="metrics_header__select">
            <FormSelect
              key={defaultChartType ?? 'barChart'}
              name={''}
              label={''}
              defaultValue={defaultChartType ?? 'barChart'}
              options={charts}
              onSelectionChange={(value) => setSelectedChart(value?.value ?? 'barChart')}
            />
          </div>
        </div>
      </div>
      <div className="charts_wrapper">
        {buildChart()}
      </div>
      {data.qualityData != null && (
        <div className="quality_summary">
          {data.qualityData.totalChats != null && data.qualityData.chatsWithThemes != null && (
            <>
              <span className="quality_summary__label">
                <Trans
                  i18nKey="chats.qualityThemesSentence"
                  values={{
                    value: data.qualityData.totalChats > 0
                      ? ((data.qualityData.chatsWithThemes / data.qualityData.totalChats) * 100).toFixed(1)
                      : '0',
                  }}
                  components={[<strong key="0" />]}
                />
              </span>
              <Tooltip content={<span style={{ maxWidth: 320, display: 'inline-block' }}>{t('chats.qualityThemesTooltip')}</span>}>
                <span className="quality_summary__icon">
                  <MdOutlineInfo />
                </span>
              </Tooltip>
            </>
          )}
          {data.qualityData.totalBuerokrattChats != null && data.qualityData.buerokrattChatsWithQuality != null && (
            <>
              <span className="quality_summary__label">
                <Trans
                  i18nKey="chats.qualityResponseQualitySentence"
                  values={{
                    value: data.qualityData.totalBuerokrattChats > 0
                      ? ((data.qualityData.buerokrattChatsWithQuality / data.qualityData.totalBuerokrattChats) * 100).toFixed(1)
                      : '0',
                  }}
                  components={[<strong key="0" />]}
                />
              </span>
              <Tooltip content={<span style={{ maxWidth: 320, display: 'inline-block' }}>{t('chats.qualityResponseQualityTooltip')}</span>}>
                <span className="quality_summary__icon">
                  <MdOutlineInfo />
                </span>
              </Tooltip>
            </>
          )}
          {data.qualityData.chatsWithFollowUp != null && (
            <>
              <span className="quality_summary__label">
                <Trans
                  i18nKey="chats.qualityFollowUpSentence"
                  values={{ value: data.qualityData.chatsWithFollowUp }}
                  components={[<strong key="0" />]}
                />
              </span>
              <Tooltip content={<span style={{ maxWidth: 320, display: 'inline-block' }}>{t('chats.qualityFollowUpTooltip')}</span>}>
                <span className="quality_summary__icon">
                  <MdOutlineInfo />
                </span>
              </Tooltip>
            </>
          )}
        </div>
      )}
      {isRatingDistribution && (data.distributionData?.totalChats != null || data.distributionData?.totalFeedback != null) && (
        <div className="feedback_summary" style={{ marginTop: 16, padding: '12px 0' }}>
          <div style={{ marginBottom: 4 }}>
            <span>
              {feedbackScoreLabel}: {formatPeriodScore(periodScore)}
            </span>
          </div>
          <div style={{ marginBottom: 4 }}>
            {t('feedback.percentOfChatsWithFeedback')}:{' '}
            {data.distributionData?.totalChats != null && data.distributionData.totalChats > 0
              ? `${((data.distributionData.totalFeedback ?? 0) / data.distributionData.totalChats * 100).toFixed(1)}%`
              : '0%'}
          </div>
          <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Tooltip content={<span style={{ maxWidth: 320, display: 'inline-block' }}>{t('feedback.tooltip_averageFeedbackRating')}</span>}>
              <span style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                {t('feedback.averageFeedbackRating')} <MdOutlineInfo />
              </span>
            </Tooltip>
            : {averageFeedbackRating}
          </div>
          <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Tooltip content={<span style={{ maxWidth: 320, display: 'inline-block' }}>{t('feedback.tooltip_satisfied')}</span>}>
              <span style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                {t('feedback.satisfied')} <MdOutlineInfo />
              </span>
            </Tooltip>
            : {satisfiedPct}
          </div>
          <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Tooltip content={<span style={{ maxWidth: 320, display: 'inline-block' }}>{t('feedback.tooltip_passive')}</span>}>
              <span style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                {t('feedback.passive')} <MdOutlineInfo />
              </span>
            </Tooltip>
            : {passivePct}
          </div>
          <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Tooltip content={<span style={{ maxWidth: 320, display: 'inline-block' }}>{t('feedback.tooltip_dissatisfied')}</span>}>
              <span style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                {t('feedback.dissatisfied')} <MdOutlineInfo />
              </span>
            </Tooltip>
            : {dissatisfiedPct}
          </div>
          <div>
            {t('feedback.chatsWithNoFeedback')}: {data.distributionData?.noFeedbackCount ?? (data.distributionData?.totalChats != null && data.distributionData?.totalFeedback != null ? data.distributionData.totalChats - data.distributionData.totalFeedback : '—')}
          </div>
        </div>
      )}
    </Card>
  );
};

export default MetricsCharts;
