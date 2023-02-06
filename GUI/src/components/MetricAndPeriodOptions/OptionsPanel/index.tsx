import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next';
import Card from '../../Card';
import { periodOptions } from './data';
import MetricOptionsGroup from '../MetricOptionsGroup';
import SubOptionsGroup from '../SubOptionsGroup';
import { MetricOptionsState, Option } from "../types";
import Section from '../../Section';

interface MetricOptionsProps {
    metricOptions: Option[],
    onChange: (selection: MetricOptionsState) => void,
}

const MetricOptions: React.FC<MetricOptionsProps> = ({
    metricOptions,
    onChange,
}) => {
    const { t } = useTranslation();
    const [selection, setSelection] = useState<MetricOptionsState>({
        period: '',
        metric: '',

        start: '',
        end: '',
        options: [],
    })

    useEffect(() => {
        if (metricOptions.length === 1) {
            setSelection({ ...selection, metric: metricOptions[0].id, options: [] })
        }
    }, [])

    useEffect(() => {
        onChange(selection)
    }, [selection])


    const subOptions = useMemo(() =>
        metricOptions.find((x) => x.id === selection.metric)?.subOptions ?? [],
        [selection.metric]
    );

    return (
        <Card>
            <Section>
                <MetricOptionsGroup
                    options={periodOptions}
                    label={t('general.period')}
                    onChange={(period) => setSelection({ ...selection, period, start: '', end: '', })}
                    onDatePicked={(date, type) => {
                        let newValue = {};
                        if (type === 'start')
                            newValue = { start: date }
                        else if (type === 'end')
                            newValue = { end: date }
                        else if (type === 'month')
                            newValue = {
                                start: date,
                                end: date,
                            }

                        setSelection({ ...selection, ...newValue })
                    }}
                />
            </Section>
            {
                metricOptions.length > 1 &&
                <Section>
                    <MetricOptionsGroup
                        options={metricOptions}
                        label={t('general.metric')}
                        onChange={(metric) => setSelection({ ...selection, metric, options: [] })}
                    />
                </Section>
            }
            {
                subOptions.length > 0 &&
                <Section>
                    <SubOptionsGroup
                        subOptions={subOptions}
                        label={t('general.additionalOptions')}
                        onChange={(options) => setSelection({ ...selection, options, })}
                    />
                </Section>
            }
        </Card>
    )
}

export default MetricOptions
