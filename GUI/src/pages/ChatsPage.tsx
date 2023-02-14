import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators'
import OptionsPanel, { Option } from '../components/MetricAndPeriodOptions';
import { MetricOptionsState } from '../components/MetricAndPeriodOptions/types';
import MetricsCharts from '../components/MetricsCharts';
import { formatDate } from '../util/charts-utils';

const chatOptions: Option[] = [
    {
        id: 'total',
        labelKey: 'chats.total',
        subOptions: [
            { id: 'onlyBYK', labelKey: 'chats.options.onlyBYK', color: '#f00' },
            { id: 'csaInvolved', labelKey: 'chats.options.csaInvolved', color: '#0f0' },
        ]
    },
    {
        id: 'cip',
        labelKey: 'chats.cip',
        subOptions: [
            { id: 'outsideWork', labelKey: 'chats.options.outsideWorkingHours', color: '#f00' },
            { id: 'longWaitting', labelKey: 'chats.options.longWaitingTime', color: '#0f0' },
            { id: 'allCsvAway', labelKey: 'chats.options.allCsvAway', color: '#00f' },
        ]
    },
    {
        id: 'avgWaitingTime',
        labelKey: 'chats.avgWaitingTime',
        subOptions: [
            { id: 'median', labelKey: 'chats.options.median', color: '#f00' },
            { id: 'arithmetic', labelKey: 'chats.options.arithmetic', color: '#0f0' },
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
                        default:
                            return fetchData()
                    }
                }),
            )
            .subscribe((chartData: any) => setChartData(chartData))

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const fetchData = async () => {
        console.log('first')
    }

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
                data={[]}
                dataKey='chartKey'
                startDate={configs?.start ?? formatDate(new Date(), 'yyyy-MM-dd')}
                endDate={configs?.end ?? formatDate(new Date(), 'yyyy-MM-dd')}
            />
        </>
    )
}

export default ChatsPage
