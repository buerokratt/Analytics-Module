import { Option } from '../../components/MetricAndPeriodOptions';

export const chatOptions: Option[] = [
  {
    id: 'total',
    labelKey: 'chats.total',
    subOptions: [
      { id: 'byk', labelKey: 'chats.onlyBYK', color: '#fdbf47' },
      { id: 'csa', labelKey: 'chats.csaInvolved', color: '#ed7d32' },
    ],
    unit: 'chats',
  },
  {
    id: 'cip',
    labelKey: 'chats.cip',
    subOptions: [
      { id: 'outside-working-hours', labelKey: 'chats.outsideWorkingHours', color: '#fdbf47' },
      { id: 'long-waiting-time', labelKey: 'chats.longWaitingTime', color: '#ed7d32' },
      { id: 'all-csas-away', labelKey: 'chats.allCsvAway', color: '#8ab4d5' },
    ],
    unit: 'chats'
  },
  {
    id: 'avgWaitingTime',
    labelKey: 'chats.avgWaitingTime',
    subOptions: [
      { id: 'avg', labelKey: 'chats.averageWaitingTime', color: '#fdbf47' },
      { id: 'median', labelKey: 'chats.medianWaitingTime', color: '#ed7d32' },
    ],
    unit: 'seconds',
  },
  {
    id: 'totalMessages',
    labelKey: 'chats.totalMessages',
    unit: 'messages',
  },
  {
    id: 'duration',
    labelKey: 'chats.duration',
    unit: 'minutes',
  },
  {
    id: 'idle',
    labelKey: 'chats.idle',
    unit: 'chats',
  },
]
