import { useTranslation } from 'react-i18next'
import React, { useEffect, useState } from 'react';
import axios from 'axios'
import OptionsPanel, { Option } from '../components/MetricAndPeriodOptions';
import MetricsCharts from '../components/MetricsCharts';
import ChatsTable from '../components/ChatsTable'
import { getAverageFeedbackOnBuerokrattChats, getNegativeFeedbackChats, getNpsOnCSAChatsFeedback } from '../resources/api-constants'
import { MetricOptionsState } from '../components/MetricAndPeriodOptions/types';
import { Chat } from '../types/chat';

const FeedbackPage: React.FC = () => {
    const [chartData, setChartData] = useState([])
    const [negativeFeedbackChats, setNegativeFeedbackChats] = useState<Chat[]>([]);
    const [currentMetric, setCurrentMetric] = useState('feedback.statuses')
    const random = () => Math.floor(Math.random() * 255);
    const [currentConfigs, setConfigs] = useState<MetricOptionsState & {
        groupByPeriod: string;
    }>()
    const { t } = useTranslation()

    useEffect(() => {
        switch (currentConfigs?.metric) {
            case 'burokratt_chats':
              fetchAverageFeedbackOnBuerokrattChats();
              break;
            case 'advisor_chats':
                fetchNpsOnCSAChatsFeedback();
              break;
            case 'negative_feedback':
                fetchChatsWithNegativeFeedback();
              break;  
        }
    }, [currentConfigs]);

    const fetchAverageFeedbackOnBuerokrattChats = async () => {
        const result = await axios.post(getAverageFeedbackOnBuerokrattChats(), {
            'metric': currentConfigs?.groupByPeriod ?? 'day',
            'start_date': currentConfigs?.start,
            'end_date': currentConfigs?.end,
        });
        setChartData(result.data.response)
    }


    const fetchNpsOnCSAChatsFeedback = async () => {
        const result = await axios.post(getNpsOnCSAChatsFeedback(), {
            'metric': currentConfigs?.groupByPeriod ?? 'day',
            'start_date': currentConfigs?.start,
            'end_date': currentConfigs?.end,
        });
        setChartData(result.data.response)
    }

    const fetchChatsWithNegativeFeedback = async () => {
        const result = await axios.post(getNegativeFeedbackChats(), {
            'events': "",
            'start_date': currentConfigs?.start,
            'end_date': currentConfigs?.end,
        }, { withCredentials: true });
        setChartData(result.data.response)
        setNegativeFeedbackChats(result.data.response)
    }

    const feedbackMetrics: Option[] = [
        {
            id: 'statuses',
            labelKey: 'feedback.statuses',
            subOptions: [
                { id: 'client_left_with_answer', labelKey: 'feedback.status_options.client_left_with_answer', color: `rgb(${random()}, ${random()}, ${random()})`},
                { id: 'client_left_without_answer', labelKey: 'feedback.status_options.client_left_without_answer', color: `rgb(${random()}, ${random()}, ${random()})` },
                { id: 'terminated', labelKey: 'feedback.status_options.terminated', color: `rgb(${random()}, ${random()}, ${random()})` },
                { id: 'accepted', labelKey: 'feedback.status_options.accepted', color: `rgb(${random()}, ${random()}, ${random()})` },
                { id: 'hate_speech', labelKey: 'feedback.status_options.hate_speech', color: `rgb(${random()}, ${random()}, ${random()})` },
                { id: 'answered_in_other_channel', labelKey: 'feedback.status_options.answered_in_other_channel', color:`rgb(${random()}, ${random()}, ${random()})` },
                { id: 'other_reasons', labelKey: 'feedback.status_options.other_reasons', color: `rgb(${random()}, ${random()}, ${random()})` },
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
                dateFormat='yyyy-MM-dd'
                onChange={(config) => {
                    setConfigs(config);
                    setCurrentMetric(`feedback.${config.metric}`);
                }}
            />
            <MetricsCharts title={currentMetric} data={chartData}/>
            {negativeFeedbackChats.length > 0 && currentConfigs?.metric === 'negative_feedback' && <ChatsTable dataSource={negativeFeedbackChats} />}
        </>
    )
}


export default FeedbackPage
