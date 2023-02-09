import { useTranslation } from 'react-i18next'
import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios'
import OptionsPanel, { Option } from '../components/MetricAndPeriodOptions';
import MetricsCharts from '../components/MetricsCharts';
import ChatsTable from '../components/ChatsTable'
import { getAverageFeedbackOnBuerokrattChats, getChatsStatuses, getNegativeFeedbackChats, getNpsOnCSAChatsFeedback, getNpsOnSelectedCSAChatsFeedback } from '../resources/api-constants'
import { MetricOptionsState } from '../components/MetricAndPeriodOptions/types';
import { Chat } from '../types/chat';

const FeedbackPage: React.FC = () => {
    const [chartData, setChartData] = useState([])
    const [chartKey, setChartKey] = useState('created');
    const [negativeFeedbackChats, setNegativeFeedbackChats] = useState<Chat[]>([]);
    const [currentMetric, setCurrentMetric] = useState('feedback.statuses')
    const random = () => Math.floor(Math.random() * 255);
    const [currentConfigs, setConfigs] = useState<MetricOptionsState & {
        groupByPeriod: string;
    }>()

    const [feedbackMetrics, setFeedbackMetrics] = useState<Option[]>([
        {
            id: 'statuses',
            labelKey: 'feedback.statuses',
            subOptions: [
                { id: 'answered', labelKey: 'feedback.status_options.answered', color: `rgb(${random()}, ${random()}, ${random()})`},
                { id: 'client-left', labelKey: 'feedback.status_options.client_left', color: `rgb(${random()}, ${random()}, ${random()})` },
                { id: 'idle', labelKey: 'feedback.status_options.idle', color: `rgb(${random()}, ${random()}, ${random()})` },
                { id: 'accepted', labelKey: 'feedback.status_options.accepted', color: `rgb(${random()}, ${random()}, ${random()})` },
                { id: 'hate-speech', labelKey: 'feedback.status_options.hate_speech', color: `rgb(${random()}, ${random()}, ${random()})` },
                { id: 'to-contact', labelKey: 'feedback.status_options.to_contact', color:`rgb(${random()}, ${random()}, ${random()})` },
                { id: 'terminated', labelKey: 'feedback.status_options.terminated', color: `rgb(${random()}, ${random()}, ${random()})` },
            ]
        },
        { id: 'burokratt_chats', labelKey: 'feedback.burokratt_chats'},
        { id: 'advisor_chats', labelKey: 'feedback.advisor_chats' },
        { id: 'selected_advisor_chats', labelKey: 'feedback.selected_advisor_chats'},
        { id: 'negative_feedback', labelKey: 'feedback.negative_feedback' },
    ])

    const { t } = useTranslation()

    useEffect(() => {
        switch (currentConfigs?.metric) {
            case 'statuses':
                fetchChatsStatuses();
              break;
            case 'burokratt_chats':
              fetchAverageFeedbackOnBuerokrattChats();
              break;
            case 'advisor_chats':
                fetchNpsOnCSAChatsFeedback();
              break;
            case 'selected_advisor_chats':
                fetchNpsOnSelectedCSAChatsFeedback();
              break;  
            case 'negative_feedback':
                fetchChatsWithNegativeFeedback();
              break;  
        }
    }, [currentConfigs]);

    const fetchChatsStatuses = async () => {
       const events = currentConfigs?.options.filter((e) => e === 'answered' || e === 'client-left' || e === 'idle') ?? [];
       const csa_events= currentConfigs?.options.filter((e) => e !== 'answered' && e !== 'client-left' && e !== 'idle') ?? [];
       const result = await axios.post(getChatsStatuses(), {
        'metric': currentConfigs?.groupByPeriod ?? 'day',
        // 'start_date': currentConfigs?.start,
        // 'end_date': currentConfigs?.end,
        "start_date": "2021-01-16",
        "end_date": "2023-01-17",
        'events': events?.length > 0 ? events : null,
        'csa_events': csa_events?.length > 0 ? csa_events : null
      });
     
      const response: [] = result.data.response.flat(1);
      console.log(response);
      setChartKey('dateTime')
      setChartData(response);

    }

    const fetchAverageFeedbackOnBuerokrattChats = async () => {
        const result = await axios.post(getAverageFeedbackOnBuerokrattChats(), {
            'metric': currentConfigs?.groupByPeriod ?? 'day',
            'start_date': currentConfigs?.start,
            'end_date': currentConfigs?.end,
        });
        console.log(result.data.response);
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

    const fetchNpsOnSelectedCSAChatsFeedback = async () => {
        const result = await axios.post(getNpsOnSelectedCSAChatsFeedback(), {
            'metric': currentConfigs?.groupByPeriod ?? 'day',
            'start_date': '2022-11-07',//currentConfigs?.start,
            'end_date': '2023-11-07', //currentConfigs?.end,
            'excluded_csas': ['']
        });
 
        const res = result.data.response;
        setChartData(res)

        const advisorsIds = new Set(res.map((advisor: any) => advisor.customerSupportId))
        const advisorsList : Map<any,any>[] = [];
        advisorsIds.forEach((id) => {
           return advisorsList.push(res.find((e: any) => e.customerSupportId === id));
        })
        const updatedMetrics = [...feedbackMetrics]
        const updatedMetricsAdvisors: any = [];
 
        advisorsList.forEach((advisor: any) => {
            updatedMetricsAdvisors.push({id: advisor?.customerSupportId ?? '', labelKey: advisor?.customerSupportDisplayName ?? '', color: `rgb(${random()}, ${random()}, ${random()})` });
        })
        updatedMetrics[3].subOptions = updatedMetricsAdvisors;
        console.log(updatedMetrics);
        setFeedbackMetrics(updatedMetrics);
        console.log(advisorsList);
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
            <MetricsCharts title={currentMetric} data={chartData} dataKey={chartKey}/>
            {negativeFeedbackChats.length > 0 && currentConfigs?.metric === 'negative_feedback' && <ChatsTable dataSource={negativeFeedbackChats} />}
        </>
    )
}


export default FeedbackPage
function useFocusEffect(arg0: () => void, arg1: ((MetricOptionsState & { groupByPeriod: string; }) | undefined)[]) {
    throw new Error('Function not implemented.');
}

