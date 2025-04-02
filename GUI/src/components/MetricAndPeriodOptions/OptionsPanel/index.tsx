import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Card from '../../Card'
import { periodOptions } from './data'
import MetricOptionsGroup from '../MetricOptionsGroup'
import SubOptionsGroup from '../SubOptionsGroup'
import { MetricOptionsState, Option, OnChangeCallback } from '../types'
import Section from '../../Section'
import { formatDate } from '../../../util/charts-utils'
import { FormRadios } from 'components/FormElements'

interface MetricOptionsProps {
  metricOptions: Option[];
  onChange: (selection: OnChangeCallback) => void;
  dateFormat?: string;
  useColumns?: boolean;
  enableSelectAll?: boolean;
}

const MetricOptions: React.FC<MetricOptionsProps> = ({
                                                       metricOptions,
                                                       dateFormat,
                                                       onChange,
                                                       useColumns,
                                                       enableSelectAll = false,
                                                     }) => {
  const { t } = useTranslation();
  const [selection, setSelection] = useState<MetricOptionsState>({
    period: '',
    metric: '',
    start: formatDate(new Date(), dateFormat ?? 'EEE MMM dd yyyy'),
    end: formatDate(new Date(), dateFormat ?? 'EEE MMM dd yyyy'),
    options: [],
    groupByPeriod: '',
  })

  useEffect(() => {
    if (metricOptions.length === 1) {
      setSelection((selection) => ({
        ...selection,
        metric: metricOptions[0].id,
        options: getSubOptionIds(metricOptions, metricOptions[0].id),
      }))
    }
    setPeriod('today')
  }, [])

  useEffect(() => {
    const groupByPeriod = selection.start === selection.end ? 'hour' : 'day'
    onChange({ ...selection, groupByPeriod })
  }, [selection])

  const subOptions = useMemo(
    () => metricOptions.find((x) => x.id === selection.metric)?.subOptions ?? [],
    [metricOptions.find((x) => x.id === selection.metric)?.subOptions],
  )

  const subRadioOptions = useMemo(
    () => metricOptions.find((x) => x.id === selection.metric)?.subRadioOptions ?? [],
    [metricOptions.find((x) => x.id === selection.metric)?.subRadioOptions]
  );

  const setPeriod = (period: any): void => setSelection((selection) => ({ ...selection, period }))

  return (
    <Card>
      <Section>
        <MetricOptionsGroup
          dateFormat={dateFormat}
          options={periodOptions}
          label={t('general.period')}
          onChange={setPeriod}
          onDatePicked={(start, end) => {
            setSelection({ ...selection, start, end });
          }}
        />
      </Section>
      {metricOptions.length > 1 && (
        <Section>
          <MetricOptionsGroup
            dateFormat={dateFormat}
            options={metricOptions}
            label={t('general.chooseMetric')}
            onChange={(metric) =>
              setSelection({ ...selection, metric, options: getSubOptionIds(metricOptions, metric) })
            }
          />
        </Section>
      )}
      {subOptions.length > 0 && (
        <Section>
          <SubOptionsGroup
            subOptions={subOptions}
            label={t('general.additionalOptions')}
            onChange={(options) => setSelection({ ...selection, options })}
            useColumns={useColumns}
            enableSelectAll={enableSelectAll ?? false}
          />
        </Section>
      )}
      {subRadioOptions.length > 0 && (
        <Section>
            <FormRadios
              name="graphData"
              label={t('general.additionalOptions')}
              items={subRadioOptions.map((option) => ({
                label: t(`${option.labelKey}`),
                value: option.id,
              }))}
              onChange={(options) => {
                setSelection({ ...selection, options });
              }}
            />
        </Section>
      )}
    </Card>
  );
}

const getSubOptionIds = (metricOptions: Option[], metric: string) =>
    metricOptions.find((x) => x.id === metric)?.subOptions?.map((x) => x.id) ?? [];

export default MetricOptions
