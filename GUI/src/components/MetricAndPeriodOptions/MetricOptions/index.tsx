import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next';
import Card from '../../Card';
import { periodOptions } from './data';
import Divider from '../Divider';
import MetricOptionsGroup from '../MetricOptionGroup';
import SubOptionsGroup from '../SubOptionsGroup';
import { MetricOptionsState, Option } from "../types";


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
        onChange(selection)
    }, [selection])


    const subOptions = useMemo(() =>
        metricOptions.find((x) => x.id === selection.metric)?.subOptions ?? [],
        [selection.metric]
    );

    return (
        <Card>
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
            <Divider />
            <MetricOptionsGroup
                options={metricOptions}
                label={t('general.metric')}
                onChange={(metric) => setSelection({ ...selection, metric, options: [] })}
            />
            {subOptions.length > 0 && <Divider />}
            {
                subOptions.length > 0 &&
                <SubOptionsGroup
                    subOptions={subOptions}
                    label={t('general.additionalOptions')}
                    onChange={(options) => setSelection({ ...selection, options, })}
                />
            }
        </Card>
    )
}

export default MetricOptions
