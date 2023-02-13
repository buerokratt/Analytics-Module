import React from 'react'
import OptionsPanel, { Option } from '../components/MetricAndPeriodOptions';

const chatMetricOptions: Option[] = [
    {
        id: 'totalChatNumber',
        labelKey: 'chats.metric.totalNumber',
        subOptions: [
            { id: 'burokrat', labelKey: 'chats.metric.median', color: '#0ff' },
            { id: 'csa', labelKey: 'chats.metric.arithmetic', color: '#00f' },
        ]
    },
    {
        id: 'cip',
        labelKey: 'chats.metric.cip',
        subOptions: [
            { id: 'option3', labelKey: 'general.option3', color: '#0ff' },
            { id: 'option4', labelKey: 'general.option4', color: '#00f' },
        ]
    },
    {
        id: 'avgWaitingTime',
        labelKey: 'chats.metric.avgWaitingTime',
        subOptions: [
            { id: 'median', labelKey: 'chats.metric.median', color: '#0ff' },
            { id: 'arithmetic', labelKey: 'chats.metric.arithmetic', color: '#00f' },
        ]
    },
    { id: 'avgMessageNumberInChat', labelKey: 'chats.metric.avgMessageNumberInChat' },
    { id: 'avgDurationOfChat', labelKey: 'chats.metric.avgDurationOfChat' },
    { id: 'idleChatCount', labelKey: 'chats.metric.idleChatCount' },
];

const ChatsPage: React.FC = () => {
    return (
        <>
            <h1>Chats</h1>
            <OptionsPanel
                metricOptions={chatMetricOptions}
                onChange={(config) => console.log(config)}
            />
        </>
    )
}

export default ChatsPage
