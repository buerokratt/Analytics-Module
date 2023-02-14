import React, { useEffect, useState, Component } from "react";
import { useTranslation } from "react-i18next";
import Track from "../../Track";
import CheckBoxWithColorIndicator from "../CheckboxWithColorIndicator";
import { SubOption } from "../types";
import './styles.scss'

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
        const selectedOptions = subOptions
            .filter((x => x.isSelected === undefined || x.isSelected === true))
            .map((x) => x.id)
        setSelectedValues(selectedOptions)
    }, [subOptions])

    useEffect(() => {
        onChange(selectedValues)
    }, [selectedValues.length])

    return (
        <Track gap={100} isAlignItems={false}>
            <div className='additional-option-label'>{label}</div>
            <Track isMultiline={true} isFlex={true}>
                {subOptions.map((option) =>
                    <CheckBoxWithColorIndicator
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
            </Track>
        </Track>
    )
}

export default SubOptionsGroup
