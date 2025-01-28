import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { MdOutlineDownload } from 'react-icons/md';
import { Button, Card, FormSelect, Icon } from '../../components';
import BarGraph from '../BarGraph';
import './MetricsCharts.scss';
import LineGraph from '../LineGraph';
import PieGraph from '../PieGraph';
import { getXlsx } from '../../resources/api-constants';
import { ChartType } from '../../types/chart-type';
import { chartDataKey, formatDate, getKeys } from '../../util/charts-utils';
import { GroupByPeriod } from '../MetricAndPeriodOptions/types';
import { request, Methods } from '../../util/axios-client';
import { Buffer } from 'buffer';

type Props = {
  title: any;
  data: any;
  startDate: string;
  endDate: string;
  unit?: string;
  groupByPeriod: GroupByPeriod;
};

const MetricsCharts = ({ title, data, startDate, endDate, unit, groupByPeriod }: Props) => {
  const { t } = useTranslation();

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
  const [selectedChart, setSelectedChart] = useState<string>('barChart');

  const buildChart = () => {
    if (selectedChart === 'pieChart') {
      return (
        <PieGraph
          data={data}
          unit={unit}
        />
      );
    } else if (selectedChart === 'lineChart') {
      return (
        <LineGraph
          data={data}
          startDate={startDate}
          endDate={endDate}
          unit={unit}
        />
      );
    } else {
      return (
        <BarGraph
          data={data}
          startDate={startDate}
          endDate={endDate}
          unit={unit}
          groupByPeriod={groupByPeriod}
        />
      );
    }
  };

  // todo fix burokratt/nopuistaja prefix

  const downloadXlsx = async (data: any[]) => {
    const modifiedData: any[] = data.map((item) => {
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
        data: modifiedData.map((p) => {
          const { [chartDataKey]: originalKey, ...rest } = p;
          return {
            [t(`global.${chartDataKey}`)]: formatDate(new Date(originalKey), 'dd.MM.yyyy'),
            ...rest,
          };
        }),
      },
    });

    const blob = new Blob([Buffer.from(res.base64String, 'base64')], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const fileName = 'metrics.xlsx';

    if (window.showSaveFilePicker) {
      const handle = await window.showSaveFilePicker({ suggestedName: fileName });
      const writable = await handle.createWritable();
      await writable.write(blob);
      writable.close();
    } else {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <Card
      header={
        <div className="container">
          <div className="title">
            <h3>
              {t(title)}{' '}
              {startDate !== endDate
                ? `${formatTimestamp(startDate)} - ${formatTimestamp(endDate)}`
                : formatTimestamp(startDate)}
            </h3>
          </div>
          <div className="other_content">
            <Button
              appearance="text"
              style={{ marginRight: 15 }}
              onClick={() => {
                downloadXlsx(data.chartData);
              }}
            >
              <Icon
                icon={<MdOutlineDownload />}
                size="small"
              />
              {t('feedback.xlsx')}
            </Button>
            <FormSelect
              name={''}
              label={''}
              defaultValue={'barChart'}
              options={charts}
              onSelectionChange={(value) => setSelectedChart(value?.value ?? 'barChart')}
            />
          </div>
        </div>
      }
    >
      {buildChart()}
    </Card>
  );
};

export default MetricsCharts;

const formatTimestamp = (timestamp: string) => formatDate(new Date(timestamp), 'dd.MM.yyyy');
