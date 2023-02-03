import React, { useEffect, useMemo, useState } from "react";
import ReactDatePicker from "react-datepicker";
import { useTranslation } from "react-i18next";
import ToggleButton from "../ToggleButton";
import { Option } from "../types";
import "./styles.scss";

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
        <div className="container">
            <div className="options-label">
                {label}
            </div>
            <div className="option-group-column">
                <div>
                    {options.map((option) =>
                        <ToggleButton
                            key={option.id}
                            label={t(option.labelKey)}
                            value={option.id}
                            selectedValue={selectedValue}
                            onClick={setSelectedValue} />
                    )}
                </div>
                <div className="date-picker-wrapper-container">
                    {
                        additionalKey === 'monthpicker' &&
                        <ReactDatePicker
                            selected={start}
                            onChange={(date) => {
                                if (!date) return;
                                changeMonthDate(date)
                            }}
                            showMonthYearPicker
                            dateFormat={'MMMM yyyy'}
                            locale='et-EE'
                            wrapperClassName="picker-container-wrapper"
                            className='picker-container'
                        />
                    }
                    {
                        additionalKey === 'customperiodpicker' &&
                        <div className="date-range-picker-container">
                            <ReactDatePicker
                                selected={start}
                                onChange={(date) => {
                                    if (!date) return;
                                    changeStartDate(date);

                                    if (date > end)
                                        changeEndDate(date);
                                }}
                                dateFormat={'dd.MM.yyyy'}
                                locale='et-EE'
                                wrapperClassName='picker-container-wrapper'
                                className='picker-container'
                            />
                            <span className="until">{t('general.until')}</span>
                            <ReactDatePicker
                                selected={end}
                                minDate={start}
                                onChange={(date) => {
                                    if (!date) return;
                                    changeEndDate(date);
                                }}
                                dateFormat={'dd.MM.yyyy'}
                                locale='et-EE'
                                wrapperClassName='picker-container-wrapper'
                                className='picker-container'
                            />
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default MetricOptionsGroup
