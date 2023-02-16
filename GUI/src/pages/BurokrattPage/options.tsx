import { Option } from '../../components/MetricAndPeriodOptions'

export const metricOptions: Option[] = [
    {
        id: 'intents',
        labelKey: 'burokratt.intents',
        subOptions: [
            { id: 'ordered', labelKey: 'burokratt.orderByUsability', color: 'red' },
            { id: 'new', labelKey: 'burokratt.newIntents', color: 'blue' },
            { id: 'modified', labelKey: 'burokratt.modifiedIntents', color: 'green' },
            { id: 'avg', labelKey: 'burokratt.avgChatIntents', color: 'brown ' },
        ]
    },
    {
        id: 'sessions',
        labelKey: 'burokratt.sessions',
        subOptions: [
            { id: 'csa', labelKey: 'burokratt.csa', color: 'red' },
            { id: 'byk', labelKey: 'burokratt.idle', color: 'blue' },
            { id: 'customer', labelKey: 'burokratt.closed', color: 'green' },
        ]
    },
    { id: 'averageResponseSpeed', labelKey: 'burokratt.averageResponseSpeed' },
    { id: 'understoodQuestions', labelKey: 'burokratt.understoodQuestions' },
]
