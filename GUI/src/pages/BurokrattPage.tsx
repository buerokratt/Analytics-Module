import React from 'react'
import { useTranslation } from 'react-i18next'
import { Option } from '../components/MetricAndPeriodOptions'

const metricOptions: Option[] = [
    {
        id: 'intents',
        labelKey: 'burokratt.intents',
        subOptions: [
            { id: 'orderByUsability', labelKey: 'burokratt.orderByUsability', color: 'red' },
            { id: 'newIntents', labelKey: 'burokratt.newIntents', color: 'blue' },
            { id: 'modifiedIntents', labelKey: 'burokratt.modifiedIntents', color: 'green' },
            { id: 'avgChatIntents', labelKey: 'burokratt.avgChatIntents', color: 'pinl' },
        ]
    },
    {
        id: 'sessions',
        labelKey: 'burokratt.sessions',
        subOptions: [
            { id: 'csa', labelKey: 'burokratt.csa', color: 'red' },
            { id: 'idle', labelKey: 'burokratt.idle', color: 'blue' },
            { id: 'closed', labelKey: 'burokratt.closed', color: 'green' },
        ]
    },
    { id: 'averageResponseSpeed', labelKey: 'burokratt.averageResponseSpeed' },
    { id: 'understoodQuestions', labelKey: 'burokratt.understoodQuestions' },
]

const BurokrattPage: React.FC = () => {
    const { t } = useTranslation()

    return (
        <>
            <h1>{t('menu.burokratt')}</h1>
        </>
    )
}

export default BurokrattPage
