import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Track from '../../Track'
import CheckBoxWithColorIndicator from '../CheckboxWithColorIndicator'
import { SubOption } from '../types'
import './styles.scss'

interface SubOptionsGroupProps {
  label: string;
  subOptions: SubOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  useColumns?: boolean;
}

const SubOptionsGroup: React.FC<SubOptionsGroupProps> = ({
                                                           label,
                                                           subOptions,
                                                           selectedValues,
                                                           onChange,
                                                           useColumns,
                                                         }) => {
  const { t } = useTranslation();

  const handleOptionClicked = (option: SubOption) => {
    const newList = selectedValues.includes(option.id)
        ? selectedValues.filter((x) => x !== option.id)
        : [...selectedValues, option.id];
    onChange(newList);
  };

  return (
    <Track gap={100} isAlignItems={false}>
      <div className='additional-option-label'>{label}</div>
      <div className={useColumns ? 'two-columns-container' : 'flex-container'}>
        {subOptions.map((option) =>
          <CheckBoxWithColorIndicator
            key={option.id}
            color={option.color}
            label={t(option.labelKey)}
            selected={selectedValues.includes(option.id)}
            onClick={() => handleOptionClicked(option)}
          />
        )}
      </div>
    </Track>
  )
}

export default SubOptionsGroup
