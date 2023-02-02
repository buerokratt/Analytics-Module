import { Option } from "./types";

export const periodOptions: Option[] = [
    { id: 'today', labelKey: 'today' },
    { id: 'yesterday', labelKey: 'yesterday' },
    { id: 'last30days', labelKey: 'last30days' },
    { id: 'month', labelKey: 'month', additionalKey: 'monthpicker' },
    { id: 'period', labelKey: 'customperiod', additionalKey: 'customperiodpicker' },
];
