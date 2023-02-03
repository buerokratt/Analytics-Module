import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CheckBoxButton from "../ColoredCheckbox";
import { SubOption } from "../types";
import "./styles.scss";

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
    const { t } = useTranslation()
    const [selectedValues, setSelectedValues] = useState<string[]>([])

    useEffect(() => {
        onChange(selectedValues);
    }, [selectedValues.length])

    return (
        <div className="container">
            <div className="options-label">
                {label}
            </div>
            <div className="option-group-row">
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
                        label={t(option.labelKey)}
                        color={option.color}
                    />
                )}
            </div>
        </div>
    )
}

export default SubOptionsGroup
