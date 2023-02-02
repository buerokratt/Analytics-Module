import { useEffect, useState } from "react";
import CheckBoxButton from "../ColoredCheckbox";
import { SubOption } from "../types";

interface SubOptionsGroupProps {
    label: string,
    subOptions: SubOption[],
    onChange: (values: string[]) => void,
}

const SubOptionsGroup: React.FC<SubOptionsGroupProps> = ({
    label,
    subOptions,
    onChange,
}) => {
    const [selectedValues, setSelectedValues] = useState<string[]>([])

    useEffect(() => {
        onChange(selectedValues);
    }, [selectedValues.length])

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
                flexDirection: 'row',
                justifyContent: 'center',
                justifyItems: 'center',
            }}>
                {subOptions.map((option) =>
                    <CheckBoxButton
                        key={option.id}
                        onClick={() => {
                            const newlist = selectedValues.filter(x => x !== option.id)
                            if (newlist.length == selectedValues.length) {
                                setSelectedValues([...selectedValues, option.id])
                            } else {
                                setSelectedValues(newlist)
                            }
                        }}
                        selected={selectedValues.includes(option.id)}
                        label={option.labelKey}
                        color={option.color}
                    />
                )}
            </div>
        </div>
    )
}

export default SubOptionsGroup;