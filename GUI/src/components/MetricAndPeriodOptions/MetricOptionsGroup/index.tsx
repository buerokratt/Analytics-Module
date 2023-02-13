import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../Button";
import { FormDatepicker } from "../../FormElements";
import Track from "../../Track";
import { Option } from "../types";

type PickedDateType = 'start' | 'end' | 'month'
type DatePickHandler = ((date: string, type: PickedDateType) => void) | undefined

interface MetricOptionsGroupProps {
    label: string,
    options: Option[],
    onChange: (value: string) => void,
    onDatePicked?: DatePickHandler,
}

const MetricOptionsGroup: React.FC<MetricOptionsGroupProps> = ({
    label,
    options,
    onChange,
    onDatePicked,
}) => {
    const { t } = useTranslation()
    const [selectedValue, setSelectedValue] = useState(options[0].id)
    const [start, setStart] = useState(new Date())
    const [end, setEnd] = useState(new Date())

    useEffect(() => {
        onChange(selectedValue);
    }, [selectedValue])

    const additionalKey = useMemo(() =>
        options.find((x) => x.id === selectedValue)?.additionalKey,
        [selectedValue]
    )

    const dateToStr = (date: Date) => {
        return date.toISOString();
    }

    const changeMonthDate = (date: Date) => {
        setStart(date)
        onDatePicked?.(dateToStr(date), 'month')
    }
    const changeStartDate = (date: Date) => {
        setStart(date)
        onDatePicked?.(dateToStr(date), 'start')
    }
    const changeEndDate = (date: Date) => {
        setEnd(date)
        onDatePicked?.(dateToStr(date), 'end')
    }

    return (
        <Track gap={130} align='left'>
            {label}
            <Track direction="vertical" align="left" gap={additionalKey ? 10 : 0}>
                <Track isMultiline gap={10}>
                    {options.map((option) =>
                        <Button
                            key={option.id}
                            onClick={() => setSelectedValue(option.id)}
                            appearance={option.id === selectedValue ? 'primary' : 'secondary'}
                            size="s"
                            style={{ marginRight: '.5rem' }}
                        >
                            {t(option.labelKey)}
                        </Button>
                    )}
                </Track>
                <Track>
                    {
                        additionalKey === 'monthpicker' &&
                        <FormDatepicker
                            label=''
                            hideLabel
                            name='start'
                            value={start}
                            onChange={(date) => changeMonthDate(date)}
                            onBlur={() => { }}
                            monthPicker
                        />
                    }
                    {
                        additionalKey === 'customperiodpicker' &&
                        <Track gap={20}>
                            <FormDatepicker
                                label=''
                                hideLabel
                                name='start'
                                value={start}
                                onChange={(date) => {
                                    changeStartDate(date)

                                    if (date > end)
                                        changeEndDate(date)
                                }}
                                onBlur={() => { }}
                            />
                            {t('general.until')}
                            <FormDatepicker
                                label={t('general.until')}
                                hideLabel
                                name='end'
                                value={end}
                                onChange={(date) => {
                                    changeEndDate(date)

                                    if (date < start)
                                        changeStartDate(date)
                                }}
                                onBlur={() => { }}
                            />
                        </Track>
                    }
                </Track>
            </Track>
        </Track >
    )
}

export default MetricOptionsGroup
