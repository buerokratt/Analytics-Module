import React from 'react'
import OptionsPanel, { Option } from '../components/MetricAndPeriodOptions';


const chatOptions: Option[] = [
    {
        id: 'total',
        labelKey: 'chats.total',
        subOptions: [
            { id: 'onlyBYK', labelKey: 'chats.options.onlyBYK', color: '#f00' },
            { id: 'csaInvolved', labelKey: 'chats.options.csaInvolved', color: '#0f0' },
        ]
    },
    {
        id: 'cip',
        labelKey: 'chats.cip',
        subOptions: [
            { id: 'outsideWork', labelKey: 'chats.options.outsideWorkingHours', color: '#f00' },
            { id: 'longWaitting', labelKey: 'chats.options.longWaitingTime', color: '#0f0' },
            { id: 'allCsvAway', labelKey: 'chats.options.allCsvAway', color: '#00f' },
        ]
    },
    {
        id: 'avgWaiting',
        labelKey: 'chats.avgWaitingTime',
        subOptions: [
            { id: 'median', labelKey: 'chats.options.median', color: '#f00' },
            { id: 'arithmetic', labelKey: 'chats.options.arithmetic', color: '#0f0' },
        ]
    },
    { id: 'totalMessages', labelKey: 'chats.totalMessages' },
    { id: 'duration', labelKey: 'chats.duration' },
    { id: 'idle', labelKey: 'chats.idle' },
];

const ChatsPage: React.FC = () => {
    return (
        <>
            <h1>Chats</h1>
            <OptionsPanel
                metricOptions={chatOptions}
                onChange={(config) => console.log(config)}
            />

        </>
    )
}

export default ChatsPage
