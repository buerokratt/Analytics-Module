import React, { useEffect, useState } from "react";
import ToggleButton from "../ToggleButton";
import { Option } from "../types";


interface MetricOptionsGroupProps {
    label: string,
    options: Option[],
    onChange: (value: string) => void,
    onDatePicked?: (start: string, end: string) => void,
}

const MetricOptionsGroup: React.FC<MetricOptionsGroupProps> = ({
    label,
    options,
    onChange,
    onDatePicked,
}) => {
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
                            label={option.labelKey}
                            value={option.id}
                            selectedValue={selectedValue}
                            onClick={setSelectedValue} />
                    )}

                </div>
                <div>
                    {additionalKey === 'monthpicker' && <span><button onClick={() => onDatePicked?.('sss', 'vvv')}>click</button></span>}
                    {additionalKey === 'customperiodpicker' && <span>period selection</span>}
                </div>
            </div>
        </div>
    )
}

export default MetricOptionsGroup;