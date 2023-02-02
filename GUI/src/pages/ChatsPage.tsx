import React from 'react'
import MetricOptions, { Option } from '../components/MetricAndPeriodOptions';


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

const ChatsPage: React.FC = () => {
    return (
        <>
            <h1>Chats</h1>
            <MetricOptions metricOptions={metricOptions} />
        </>
    )
}

export default ChatsPage
