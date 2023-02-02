import React from 'react'
import MetricOptions, { Option } from '../components/MetricAndPeriodOptions';


const metricOptions: Option[] = [
    {
        id: 'metric1',
        labelKey: 'general.metric1',
        subOptions: [
            { id: 'option1', labelKey: 'general.option1', color: 'red' },
            { id: 'option2', labelKey: 'general.option2', color: 'green' },
            { id: 'option3', labelKey: 'general.option3', color: 'blue' },
        ]
    },
    { id: 'metric2', labelKey: 'general.metric2' },
    { id: 'metric3', labelKey: 'general.metric3' },
    { id: 'metric4', labelKey: 'general.metric4' },
];

const ChatsPage: React.FC = () => {
    return (
        <>
            <h1>Chats</h1>
            <MetricOptions
                metricOptions={metricOptions}
                onChange={(config) => console.log(config)}
            />
        </>
    )
}

export default ChatsPage
