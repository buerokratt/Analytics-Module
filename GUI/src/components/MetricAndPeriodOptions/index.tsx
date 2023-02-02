import React, { useEffect, useState } from 'react'
import Card from '../Card';
import Divider from './Divider';
import MetricOptionsGroup from './MetricOptionGroup';
import SubOptionsGroup from './SubOptionsGroup';
import ToggleButton from './ToggleButton';

import { Option } from "./types";



const options: Option[] = [
    { id: 'today', labelKey: 'today' },
    { id: 'yesterday', labelKey: 'yesterday' },
    { id: 'last30days', labelKey: 'last30days' },
    { id: 'month', labelKey: 'month', additionalKey: 'monthpicker' },
    { id: 'period', labelKey: 'customperiod', additionalKey: 'customperiodpicker' },
];

const metricOptions: Option[] = [
    {
        id: 'metric1',
        labelKey: 'metric1',
        subOptions: [
            { id: 'option1', labelKey: 'option1', color: 'red' },
            { id: 'option2', labelKey: 'option2', color: 'green' },
            { id: 'option3', labelKey: 'option3', color: 'blue' },
        ]
    },
    { id: 'metric2', labelKey: 'metric2' },
    { id: 'metric3', labelKey: 'metric3' },
    { id: 'metric4', labelKey: 'metric4' },
];

interface MetricOptionsState {
    period: string,
    metric: string,

    start: string,
    end: string,
    options: string[],
}

const MetricOptions: React.FC = () => {
    const [selection, setSelection] = useState<MetricOptionsState>({
        period: '',
        metric: '',

        start: '',
        end: '',
        options: [],
    })

    const subOptions = metricOptions.find((x) => x.id === selection.metric)?.subOptions ?? [];


    console.log(selection);
    return (
        <Card>
            <MetricOptionsGroup
                options={options}
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
