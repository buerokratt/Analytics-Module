import React, { useEffect, useState } from 'react'



interface Option {
    id: string;
    labelKey: string;
    additionalKey?: string;
}
const options: Option[] = [
    { id: 'today', labelKey: 'today' },
    { id: 'yesterday', labelKey: 'yesterday' },
    { id: 'last30days', labelKey: 'last30days' },
    { id: 'month', labelKey: 'month', additionalKey: 'monthpicker' },
    { id: 'period', labelKey: 'customperiod', additionalKey: 'customperiodpicker' },
];

const MetricOptions: React.FC = () => {
    const [selection, setSelection] = useState({
        period: '',
        metric: '',

        start: '',
        end: '',
        options: [],
    })

    return (
        <div>
            <MetricOptionsGroup
                options={options}
                label='Period'
                onChange={(period) => setSelection({ ...selection, period, })}
                onDatePicked={(start, end) => setSelection({ ...selection, start, end, })}
            />

            <MetricOptionsGroup
                options={[
                    { id: 'metric1', labelKey: 'metric1' },
                    { id: 'metric2', labelKey: 'metric2' },
                    { id: 'metric3', labelKey: 'metric3' },
                    { id: 'metric4', labelKey: 'metric4' },
                ]}
                label='Metric'
                onChange={(metric) => setSelection({ ...selection, metric, })}
            />
        </div>
    )
}

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
        <div
            style={{
                width: '70vw',
                display: 'flex',
                padding: '1rem',
                borderBottom: '2px solid lightgray',
            }}
        >
            <div
                style={{
                    width: '15vw',
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

interface ToggleButtonProps {
    label: string,
    value: string,
    selectedValue: string,
    onClick: (value: string) => void,
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
    label,
    value,
    selectedValue,
    onClick,
}) => {
    const pressed = value === selectedValue;
    return <button
        onClick={() => onClick(value)}
        style={{
            background: pressed ? '#004277' : '#fff',
            color: pressed ? '#fff' : '#000',
            cursor: 'pointer',
            border: '1px solid gray',
            borderRadius: '1rem',
            padding: '.3rem 1.5rem',
            margin: '.2rem',
        }}
    >
        {label}
    </button>
}


export default MetricOptions
