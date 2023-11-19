import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { MdOutlineDownload } from 'react-icons/md';
import { Button, Card, FormSelect, Icon, Track } from '../../components';
import BarGraph from '../BarGraph';
import './MetricsCharts.scss';
import LineGraph from '../LineGraph';
import PieGraph from '../PieGraph';
import axios from 'axios';
import { getCsv } from '../../resources/api-constants';
import { saveAs } from 'file-saver';
import { ChartType } from '../../types/chart-type';
import { chartDataKey, formatDate, getKeys } from '../../util/charts-utils';
import { GroupByPeriod } from '../MetricAndPeriodOptions/types';

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
      return <PieGraph data={data} />;
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

  const downloadCSV = async (data: any[]) => {
    const modifiedData: any[] = data.map((item) => {
      const modifiedItem: any = { ...item };
      getKeys(data).forEach((propertyName: any) => {
        if (!(propertyName in modifiedItem)) {
          modifiedItem[propertyName] = 0;
        }
      });
      return modifiedItem;
    });

    const res = await axios.post(
      getCsv(),
      {
        data: modifiedData.map((p) => ({
          ...p,
          [chartDataKey]: formatDate(new Date(p[chartDataKey]), 'yyyy-MM-dd hh:mm:ss a'),
        })),
        del: '',
        qul: '',
      },
      { responseType: 'blob' }
    );
    saveAs(res.data, 'metrics.csv');
  };

  return (
    <Card
      header={
        <div className="container">
          <div className="title">
            <h3>{t(title)}</h3>
          </div>
          <div className="other_content">
            <Button
              appearance="text"
              style={{ marginRight: 15 }}
              onClick={() => {
                downloadCSV(data.chartData);
              }}
            >
              <Icon
                icon={<MdOutlineDownload />}
                size="small"
              />
              {t('feedback.csv')}
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
