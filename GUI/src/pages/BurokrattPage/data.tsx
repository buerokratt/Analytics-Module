
import {
    geBykAvgResponseTime,
    getBykAvgSessionTime,
    getBykPercentOfCorrecltyUnderstood,
    getBykIntents,
} from '../../resources/api-constants';
import { fetchChartData, fetchChartDataWithSubOptions } from '../../util/api-response-handler';
import { metricOptions } from './options';

export const fetchData = (config: any) => {
    switch (config.metric) {
        case 'intents':
            return fetchChartDataWithSubOptions(getBykIntents(), config, metricOptions[0].subOptions!, true)
        case 'sessions':
            return fetchChartDataWithSubOptions(getBykAvgSessionTime(), config, metricOptions[1].subOptions!, true)
        case 'averageResponseSpeed':
            return fetchChartData(geBykAvgResponseTime(), config, metricOptions[2].labelKey!)
        case 'understoodQuestions':
            return fetchChartData(getBykPercentOfCorrecltyUnderstood(), config, metricOptions[3].labelKey)
        default:
            return []
    }
}

