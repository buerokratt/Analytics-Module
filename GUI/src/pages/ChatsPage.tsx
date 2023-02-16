import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators'
import OptionsPanel, { Option } from '../components/MetricAndPeriodOptions';
import { MetricOptionsState } from '../components/MetricAndPeriodOptions/types';
import MetricsCharts from '../components/MetricsCharts';
import {
    getAvgChatWaitingTime,
    getAvgMessagesInChats,
    getCipChats,
    getDurationChats,
    getIdleChats,
    getTotalChats
} from '../resources/api-constants';
import { fetchChartData, fetchChartDataWithSubOptions } from '../util/api-response-handler';
import { formatDate } from '../util/charts-utils';

const chatOptions: Option[] = [
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

const fetchData = (config: any) => {
    switch (config.metric) {
        case 'total':
            return fetchChartDataWithSubOptions(getTotalChats(), config, chatOptions[0].subOptions!)
        case 'cip':
            return fetchChartDataWithSubOptions(getCipChats(), config, chatOptions[1].subOptions!)
        case 'avgWaitingTime':
            return fetchChartDataWithSubOptions(getAvgChatWaitingTime(), config, chatOptions[2].subOptions!)
        case 'totalMessages':
            return fetchChartData(getAvgMessagesInChats(), config, chatOptions[3].labelKey)
        case 'duration':
            return fetchChartData(getDurationChats(), config, chatOptions[4].labelKey)
        case 'idle':
            return fetchChartData(getIdleChats(), config, chatOptions[5].labelKey)
        default:
            return []
    }
}

const ChatsPage: React.FC = () => {
    const { t } = useTranslation();
    const [tableTitleKey, setTableTitleKey] = useState(chatOptions[0].labelKey)
    const [configs, setConfigs] = useState<MetricOptionsState & { groupByPeriod: string }>()
    const [chartData, setChartData] = useState([])

    const [configsSubject] = useState(() => new Subject())
    useEffect(() => {
        const subscription = configsSubject
            .pipe(
                distinctUntilChanged(),
                debounceTime(500),
                switchMap(fetchData),
            )
            .subscribe((data: any) => data && setChartData(data))

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    return (
        <>
            <h1>{t('menu.chats')}</h1>
            <OptionsPanel
                metricOptions={chatOptions}
                onChange={(config) => {
                    setConfigs(config)
                    configsSubject.next(config)
                    const tableTitleKey = chatOptions.find(x => x.id === config.metric)?.labelKey;
                    if (tableTitleKey)
                        setTableTitleKey(tableTitleKey)
                }}
                dateFormat="yyyy-MM-dd"
            />
            <MetricsCharts
                title={tableTitleKey}
                data={chartData}
                dataKey='dateTime'
                startDate={configs?.start ?? formatDate(new Date(), 'yyyy-MM-dd')}
                endDate={configs?.end ?? formatDate(new Date(), 'yyyy-MM-dd')}
            />
        </>
    )
}

export default ChatsPage
