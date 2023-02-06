import { useTranslation } from 'react-i18next'
import React, { useState } from 'react';
import OptionsPanel, { Option } from '../components/MetricAndPeriodOptions';
import MetricsCharts from '../components/MetricsCharts';


const FeedbackPage: React.FC = () => {
    const [chartData, setChartData] = useState([])
    const [currentMetric, setCurrentMetric] = useState('feedback.statuses')
    const { t } = useTranslation()

    const feedbackMetrics: Option[] = [
        {
            id: 'statuses',
            labelKey: 'feedback.statuses',
            subOptions: [
                { id: 'client_left_with_answer', labelKey: 'feedback.status.client_left_with_answer', color: '#f00' },
                { id: 'client_left_without_answer', labelKey: 'feedback.status.client_left_without_answer', color: '#0f0' },
                { id: 'terminated', labelKey: 'feedback.status.terminated', color: '#0f0' },
                { id: 'accepted', labelKey: 'feedback.status.accepted', color: '#0f0' },
                { id: 'hate_speech', labelKey: 'feedback.status.hate_speech', color: '#0f0' },
                { id: 'answered_in_other_channel', labelKey: 'feedback.status.answered_in_other_channel', color: '#0f0' },
                { id: 'other_reasons', labelKey: 'feedback.status.other_reasons', color: '#0f0' },
            ]
        },
        { id: 'burokratt_chats', labelKey: 'feedback.burokratt_chats' },
        { id: 'advisor_chats', labelKey: 'feedback.advisor_chats' },
        { id: 'selected_advisor_chats', labelKey: 'feedback.selected_advisor_chats' },
        { id: 'negative_feedback', labelKey: 'feedback.negative_feedback' },
    ];

    return (
        <>
            <h1>{t('menu.feedback')}</h1>
            <OptionsPanel
                metricOptions={feedbackMetrics}
                onChange={(config) => {
                    console.log(config);
                    setCurrentMetric(`feedback.${config.metric}`);
                }}
            />
            <MetricsCharts title={currentMetric} data={chartData}/>
        </>
    )
}


export default FeedbackPage