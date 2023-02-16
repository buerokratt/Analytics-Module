import axios from "axios"
import { t } from "i18next"
import { SubOption } from "../components/MetricAndPeriodOptions/types"

export const fetchChartDataWithSubOptions = async (
    url: string,
    config: any,
    subOptions: SubOption[]
) => {
    try {
        const result = await axios.post(url,
            {
                start_date: config?.start,
                end_date: config?.end,
                period: config?.groupByPeriod ?? 'day',
                options: config?.options.join(',') ?? ''
            })

        const chartData = result.data.response
            .reduce((acc: any, row: any, index: number) => {
                row.forEach((obj: any) => {
                    const { time, ...value } = obj
                    const newObj = {
                        dateTime: new Date(time).getTime(),
                        [t(subOptions[index].labelKey)]: value[Object.keys(value)[0]]
                    }
                    const existingObj = acc.find((item: any) => item.dateTime === newObj.dateTime);
                    if (existingObj)
                        Object.assign(existingObj, newObj)
                    else
                        acc.push(newObj)
                })
                return acc
            }, [])

        const colors = subOptions.map(x => ({ id: t(x.labelKey), color: x.color }))
        return { chartData, colors }
    } catch (_) {
        return {}
    }
}

export const fetchChartData = async (
    url: string,
    config: any,
    resultId: string,
    resultColor = 'red'
) => {
    try {
        const result = await axios.post(url,
            {
                start_date: config?.start,
                end_date: config?.end,
                period: config?.groupByPeriod ?? 'day'
            })

        const response = result.data.response.map((entry: any) => {
            const { time, ...value } = entry;

            return {
                [t(resultId)]: value[Object.keys(value)[0]],
                dateTime: new Date(time).getTime(),
            }
        })

        return {
            chartData: response,
            colors: [{ id: t(resultId), color: resultColor }],
        }
    } catch (_) {
        return {}
    }
}
