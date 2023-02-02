import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ToggleButton from "../ToggleButton";
import { Option } from "../types";


interface MetricOptionsGroupProps {
    label: string,
    options: Option[],
    onChange: (value: string) => void,
    onDatePicked?: (date: string, type: 'start' | 'end' | 'month') => void,
}

const MetricOptionsGroup: React.FC<MetricOptionsGroupProps> = ({
    label,
    options,
    onChange,
    onDatePicked,
}) => {
    const { t } = useTranslation()
    const [selectedValue, setSelectedValue] = useState(options[0].id)

    useEffect(() => {
        onChange(selectedValue);
    }, [selectedValue])

    const additionalKey = options.find((x) => x.id === selectedValue)?.additionalKey;

    return (
        <div style={{ display: 'flex' }}>
            <div
                style={{
                    width: '12vw',
                    height: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '1rem',
                }}
            >
                {label}
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
            }}>
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
                <div>
                    {additionalKey === 'monthpicker' &&
                        <input type='date' onChange={(value) => onDatePicked?.(value.target.value, 'month')} />
                    }
                    {
                        additionalKey === 'customperiodpicker' &&
                        <>
                            <input type='date' onChange={(value) => onDatePicked?.(value.target.value, 'start')} />
                            {t('general.until')}
                            <input type='date' onChange={(value) => onDatePicked?.(value.target.value, 'end')} />
                        </>
                    }
                </div>
            </div>
        </div>
    )
}

export default MetricOptionsGroup;