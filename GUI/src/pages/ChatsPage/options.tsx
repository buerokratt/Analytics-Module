import { Option } from '../../components/MetricAndPeriodOptions';

export const chatOptions: Option[] = [
    {
        id: 'total',
        labelKey: 'chats.total',
        subOptions: [
            { id: 'byk', labelKey: 'chats.onlyBYK', color: '#f00' },
            { id: 'csa', labelKey: 'chats.csaInvolved', color: '#0f0' },
        ]
    },
    {
        id: 'cip',
        labelKey: 'chats.cip',
        subOptions: [
            { id: 'outside-working-hours', labelKey: 'chats.outsideWorkingHours', color: '#f00' },
            { id: 'long-waiting-time', labelKey: 'chats.longWaitingTime', color: '#0f0' },
            { id: 'all-csas-away', labelKey: 'chats.allCsvAway', color: '#00f' },
        ]
    },
    {
        id: 'avgWaitingTime',
        labelKey: 'chats.avgWaitingTime',
        subOptions: [
            { id: 'median', labelKey: 'chats.medianWaitingTime', color: '#f00' },
            { id: 'avg', labelKey: 'chats.averageWaitingTime', color: '#0f0' },
        ]
    },
    { id: 'totalMessages', labelKey: 'chats.totalMessages' },
    { id: 'duration', labelKey: 'chats.duration' },
    { id: 'idle', labelKey: 'chats.idle' },
]
