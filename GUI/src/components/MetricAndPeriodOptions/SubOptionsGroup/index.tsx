import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import Track from '../../Track'
import CheckBoxWithColorIndicator from '../CheckboxWithColorIndicator'
import {SubOption} from '../types'
import './styles.scss'

interface SubOptionsGroupProps {
    label: string;
    subOptions: SubOption[];
    onChange: (values: string[]) => void;
    useColumns?: boolean;
    enableSelectAll?: boolean;
}


const SubOptionsGroup: React.FC<SubOptionsGroupProps> = ({
                                                             label,
                                                             subOptions,
                                                             onChange,
                                                             useColumns,
                                                             enableSelectAll = false
                                                         }) => {
    const {t} = useTranslation();

    const [selectedValues, setSelectedValues] = useState<string[]>(
        subOptions.filter((x) => x.isSelected).map((x) => x.id)
    );

    useEffect(() => {
        const selectedOptions = subOptions
            .filter((x) => x.isSelected === undefined || x.isSelected === true)
            .map((x) => x.id);
        setSelectedValues(selectedOptions);
    }, [subOptions]);

    useEffect(() => {
        onChange(selectedValues);
    }, [selectedValues]);

    const handleOptionClicked = (option: SubOption) => {
        const newList = selectedValues.filter((x) => x !== option.id);
        if (newList.length === selectedValues.length) {
            setSelectedValues([...selectedValues, option.id]);
        } else {
            setSelectedValues(newList);
        }
    };

    const handleSelectAll = (isChecked: boolean) => {
        if (isChecked) {
            const allOptionIds = subOptions.map((option) => option.id);
            setSelectedValues(allOptionIds);
        } else {
            setSelectedValues([]);
        }
    };

    const isAllSelected =
        subOptions.length > 0 &&
        subOptions.every((option) => selectedValues.includes(option.id));


    return (
        <Track gap={100} isAlignItems={false}>
            <div className="additional-option-label">{label}</div>
            <div className={useColumns ? "two-columns-container" : "flex-container"}>
                {enableSelectAll && (
                    <CheckBoxWithColorIndicator
                        key="select-all"
                        color="transparent" // Style as needed
                        label={t("general.selectAll")}
                        selected={isAllSelected}
                        onClick={() => handleSelectAll(!isAllSelected)}
                    />
                )}
                {subOptions.map((option) => (
                    <CheckBoxWithColorIndicator
                        key={option.id}
                        color={option.color}
                        label={t(option.labelKey)}
                        selected={selectedValues.includes(option.id)}
                        onClick={() => handleOptionClicked(option)}
                    />
                ))}
            </div>
        </Track>
    );
}

export default SubOptionsGroup
