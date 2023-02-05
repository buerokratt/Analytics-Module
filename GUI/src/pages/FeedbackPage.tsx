import React from 'react';
import OptionsPanel, { Option } from '../components/MetricAndPeriodOptions';

const exampleOptions: Option[] = [
    {
        id: 'metric1',
        labelKey: 'general.metric1',
        subOptions: [
            { id: 'option1', labelKey: 'general.option1', color: '#f00' },
            { id: 'option2', labelKey: 'general.option2', color: '#0f0' },
        ]
    },
    {
        id: 'metric2',
        labelKey: 'general.metric2',
        subOptions: [
            { id: 'option3', labelKey: 'general.option3', color: '#0ff' },
            { id: 'option4', labelKey: 'general.option4', color: '#00f' },
        ]
    },
    { id: 'metric3', labelKey: 'general.metric3' },
    { id: 'metric4', labelKey: 'general.metric4' },
];

const FeedbackPage: React.FC = () => {
    return (
        <>
            <h1>Feedback</h1>
            <OptionsPanel
                metricOptions={exampleOptions}
                onChange={(config) => console.log(config)}
            />
        </>
    )
}


export default FeedbackPage