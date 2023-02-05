import React from 'react';
import OptionsPanel, { Option } from '../components/MetricAndPeriodOptions';

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

const FeedbackPage: React.FC = () => {
    return (
        <>
            <h1>Feedback</h1>
            <OptionsPanel
                metricOptions={feedbackMetrics}
                onChange={(config) => console.log(config)}
            />
        </>
    )
}


export default FeedbackPage