import { Option } from "../types";

export const periodOptions: Option[] = [
    {
        id: 'today',
        labelKey: 'general.today',
    },
    {
        id: 'yesterday',
        labelKey: 'general.yesterday',
    },
    {
        id: 'last30days',
        labelKey: 'general.last30days',
    },
    {
        id: 'month',
        labelKey: 'general.months',
        additionalKey: 'monthpicker',
    },
    {
        id: 'period',
        labelKey: 'general.customperiod',
        additionalKey: 'customperiodpicker',
    },
]
