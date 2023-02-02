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

const handleDatePick = (onDatePicked: DatePickHandler, type: PickedDateType) =>
    (value: React.ChangeEvent<HTMLInputElement>) =>
        onDatePicked?.(value.target.value, type)

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
    );

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
                                setStart(date!)
                                onDatePicked?.(date?.toDateString() ?? '', 'month')
                            }}
                            showMonthYearPicker
                            dateFormat={'MMMM yyyy'}
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
                                    setStart(date!)
                                    onDatePicked?.(date?.toDateString() ?? '', 'month')
                                }}
                                dateFormat={'dd.MM.yyyy'}
                                wrapperClassName='picker-container-wrapper'
                                className='picker-container'
                            />
                            <span className="until">{t('general.until')}</span>
                            <ReactDatePicker
                                selected={end}
                                onChange={(date) => {
                                    setEnd(date!)
                                    onDatePicked?.(date?.toDateString() ?? '', 'month')
                                }}
                                dateFormat={'dd.MM.yyyy'}
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
