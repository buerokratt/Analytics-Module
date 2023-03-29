import React, { useEffect, useState, Component } from 'react'
import { useTranslation } from 'react-i18next'
import Track from '../../Track'
import CheckBoxWithColorIndicator from '../CheckboxWithColorIndicator'
import { SubOption } from '../types'
import './styles.scss'

interface SubOptionsGroupProps {
  label: string
  subOptions: SubOption[]
  onChange: (values: string[]) => void
  useColumns?: boolean
}

const SubOptionsGroup: React.FC<SubOptionsGroupProps> = ({ label, subOptions, onChange, useColumns }) => {
  const { t } = useTranslation()
  const [selectedValues, setSelectedValues] = useState<string[]>(
    subOptions.filter((x) => x.isSelected).map((x) => x.id),
  )

  useEffect(() => {
    const selectedOptions = subOptions
      .filter((x => x.isSelected === undefined || x.isSelected === true))
      .map((x) => x.id)
    setSelectedValues(selectedOptions)
  }, [subOptions])

  useEffect(() => {
    onChange(selectedValues)
  }, [selectedValues.length])

  const handleOptionClicked = (option: SubOption) => {
    const newlist = selectedValues.filter(x => x !== option.id)
    if (newlist.length == selectedValues.length)
      setSelectedValues([...selectedValues, option.id])
    else
      setSelectedValues(newlist)
  }

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
