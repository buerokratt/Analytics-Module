import React from 'react'

export const metricOptions = [
    { id: '1', titleKey: 'burokratt.metric.intents' },
    { id: '2', titleKey: 'burokratt.metric.sessions' },
    { id: '3', titleKey: 'burokratt.metric.averageResponseSpeed' },
    { id: '4', titleKey: 'burokratt.metric.understoodQuestions' },
]

export const intentsOptions = [
    { id: '1', titleKey: 'burokratt.intents.orderByUsability' },
    { id: '2', titleKey: 'burokratt.intents.newIntents' },
    { id: '3', titleKey: 'burokratt.intents.modifiedIntents' },
    { id: '4', titleKey: 'burokratt.intents.avgChatIntents' },
]

export const sessionsOptions = [
    { id: '1', titleKey: 'burokratt.sessions.csa' },
    { id: '2', titleKey: 'burokratt.sessions.idle' },
    { id: '3', titleKey: 'burokratt.sessions.closed' },
]

export const periodOptions = [
    { id: '1', titleKey: 'burokratt.period.today' },
    { id: '2', titleKey: 'burokratt.period.yesterday' },
    { id: '3', titleKey: 'burokratt.period.30Days' },
    { id: '4', titleKey: 'burokratt.period.months' },
    { id: '5', titleKey: 'burokratt.period.period' },
]


const BurokrattPage: React.FC = () => {
    return (
        <>
            <h1>Burokratt</h1>
        </>
    )
}

export default BurokrattPage
