import React, { useEffect, useMemo, useState } from 'react'
import Card from '../Card';
import { periodOptions } from './data';
import Divider from './Divider';
import MetricOptionsGroup from './MetricOptionGroup';
import SubOptionsGroup from './SubOptionsGroup';
import { MetricOptionsState, Option } from "./types";


interface MetricOptionsProps {
    metricOptions: Option[],
    onChange: (selection: MetricOptionsState) => void,
}

const MetricOptions: React.FC<MetricOptionsProps> = ({
    metricOptions,
    onChange,
}) => {
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
                label='Period'
                onChange={(period) => setSelection({ ...selection, period, })}
                onDatePicked={(start, end) => setSelection({ ...selection, start, end, })}
            />
            <Divider />
            <MetricOptionsGroup
                options={metricOptions}
                label='Metric'
                onChange={(metric) => setSelection({ ...selection, metric, options: [] })}
            />
            {subOptions.length > 0 && <Divider />}
            {
                subOptions.length > 0 &&
                <SubOptionsGroup
                    subOptions={subOptions}
                    label='AdditionalOptions'
                    onChange={(options) => setSelection({ ...selection, options, })}
                />
            }
        </Card>
    )
}

export default MetricOptions
export type { Option }