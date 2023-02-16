import axios from 'axios';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators'
import OptionsPanel, { Option } from '../components/MetricAndPeriodOptions';
import { MetricOptionsState, SubOption } from '../components/MetricAndPeriodOptions/types';
import MetricsCharts from '../components/MetricsCharts';
import {
    getAvgChatWaitingTime,
    getAvgMessagesInChats,
    getCipChats,
    getDurationChats,
    getIdleChats,
    getTotalChats
} from '../resources/api-constants';
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
];

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
                switchMap((config: any) => {
                    switch (config.metric) {
                        case 'total':
                            return fetchTotalChats(config)
                        case 'cip':
                            return fetchCipChats(config)
                        case 'avgWaitingTime':
                            return fetchAvgWaitingTime(config)
                        case 'totalMessages':
                            return fetchAvgMessagesInChats(config)
                        case 'duration':
                            return fetchDurationChats(config)
                        case 'idle':
                            return fetchIdleChats(config)
                        default:
                            return []
                    }
                }),
            )
            .subscribe((chartData: any) => {
                if (chartData)
                    setChartData(chartData)
            })

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

const fetchTotalChats = async (config: any) => {
    return fetchChartDataWithSubOptions(getTotalChats(), config, chatOptions[0].subOptions!);
}

const fetchCipChats = async (config: any) => {
    return fetchChartDataWithSubOptions(getCipChats(), config, chatOptions[1].subOptions!);
}

const fetchAvgWaitingTime = async (config: any) => {
    return fetchChartDataWithSubOptions(getAvgChatWaitingTime(), config, chatOptions[2].subOptions!);
}

const fetchAvgMessagesInChats = async (config: any) => {
    return fetchChartData(getAvgMessagesInChats(), config, 'Messages', '#FFB511')
}

const fetchDurationChats = async (config: any) => {
    return fetchChartData(getDurationChats(), config, 'Duration', '#FFB511')
}

const fetchIdleChats = async (config: any) => {
    return fetchChartData(getIdleChats(), config, 'IdleChats', '#FFB511')
}

const fetchChartDataWithSubOptions = async (url: string, config: any, subOptions: SubOption[]) => {
    let chartData = {}
    try {
        const result = await axios.post(url,
            {
                start_date: config?.start,
                end_date: config?.end,
                period: config?.groupByPeriod ?? 'day',
                options: config?.options?.join?.(',') ?? ''
            })

        const output = result.data.response
            .map((array: any) =>
                array.map((entry: any) => ({
                    ...translateChartKeys(entry, 'time'),
                    dateTime: new Date(entry.time).getTime(),
                }))
            )
            .reduce((acc: any, row: any) => {
                row.forEach((obj: any) => {
                    const existingObj = acc.find((item: any) => item.dateTime === obj.dateTime);
                    if (existingObj) {
                        Object.assign(existingObj, obj)
                    } else {
                        acc.push(obj)
                    }
                })
                return acc
            }, [])

        console.log(output)

        chartData = {
            chartData: output,
            colors: subOptions.map(x => ({ id: x.labelKey, color: x.color }))
        }
    } catch (_) {
        //error
    }
    return chartData
}

const fetchChartData = async (url: string, config: any, resultId: string, resultColor: string) => {
    let chartData = {}
    try {
        const result = await axios.post(url,
            {
                start_date: config?.start,
                end_date: config?.end,
                period: config?.groupByPeriod ?? 'day'
            })

        const response = result.data.response.map((entry: any) => ({
            ...translateChartKeys(entry, 'time'),
            dateTime: new Date(entry.time).getTime(),
        }))

        chartData = {
            chartData: response,
            colors: [{ id: resultId, color: resultColor }],
        }
    } catch (_) {
        //error
    }
    return chartData
}

export const translateChartKeys = (obj: any, key: string) =>
    Object.keys(obj).reduce(
        (acc, k) =>
            k === key
                ? acc
                : {
                    ...acc,
                    ...{ [t(`chart.${k}`)]: obj[k] },
                },
        {},
    )